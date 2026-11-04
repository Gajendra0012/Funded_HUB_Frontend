import { NextResponse, type NextRequest } from "next/server";
import { assertWebEnv } from "@/config/env";
import { CALLBACK_PATH, LOGIN_PATH, safeNextPath } from "@/lib/auth/redirects";
import { isTemporaryAuthError } from "@/lib/auth/messages";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * GET /auth/callback?code=…&next=/dashboard (WEB-10)
 *
 * Where Supabase sends the trader back after Google sign-in, an email-confirmation link or a
 * password-reset link. The one-time `code` is exchanged for a session (stored in cookies), then the
 * trader goes to `next` (only pages on this site), or first to /login for the 2FA code if they have
 * 2FA on. On failure: /login with a short reason.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  // Redirects use the site's own address (NEXT_PUBLIC_SITE_URL), not the request's: the session
  // cookies belong to that address (127.0.0.1 and localhost are different sites to a browser).
  const site = assertWebEnv().siteUrl;
  const to = (path: string) => NextResponse.redirect(new URL(path, site));
  const toLogin = (reason: string) => to(`${LOGIN_PATH}?error=${reason}`);

  // Supabase reports a cancelled Google sign-in or a bad link as ?error=…&error_description=…
  if (searchParams.get("error")) {
    return toLogin(searchParams.get("error_code") === "otp_expired" ? "link" : "google");
  }
  if (!code) return toLogin("link");

  try {
    const supabase = await getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return toLogin(isTemporaryAuthError(error) ? "unavailable" : "link");
    // With 2FA on, the trader still has to enter the code: /login resumes at that step.
    const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (level?.nextLevel === "aal2" && level.currentLevel !== "aal2") {
      return to(`${LOGIN_PATH}?${new URLSearchParams({ next })}`);
    }
    return to(next);
  } catch (err) {
    console.error(`[auth] ${CALLBACK_PATH} failed:`, err);
    return toLogin("unavailable");
  }
}
