import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { assertWebEnv } from "@/config/env";
import { HOME_AFTER_LOGIN, isGuestOnlyPath, isProtectedPath, LOGIN_PATH, safeNextPath } from "@/lib/auth/redirects";

/**
 * Runs before every page of the website (WEB-04, WEB-10):
 *  1. keeps the Supabase login session fresh (renews the token when it's about to expire; the new
 *     cookies go back to the browser, since Server Components can't set cookies themselves);
 *  2. sends visitors without a session from /dashboard and /checkout to /login (and back afterwards);
 *     a trader with 2FA on who hasn't entered the code yet counts as "not signed in" here, and
 *     /login resumes at the code step;
 *  3. sends fully signed-in traders from /login and /signup to the dashboard.
 */
export async function proxy(request: NextRequest) {
  const env = assertWebEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // When the session is renewed or cleared, pass the new cookies (and no-cache headers) on.
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Verifies the token's signature, renewing it first when needed. Keep this right after creating
  // the client: code in between could act on a stale session.
  const { data } = await supabase.auth.getClaims();
  let signedIn = Boolean(data?.claims?.sub);
  if (signedIn && data?.claims?.aal !== "aal2") {
    // Password/Google done; with 2FA on, the session isn't complete until the code (aal2).
    // Read from the session cookie: no extra request to Supabase.
    const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (level?.nextLevel === "aal2") signedIn = false;
  }
  const { pathname, search } = request.nextUrl;

  let location: string | null = null;
  if (!signedIn && isProtectedPath(pathname)) {
    location = `${LOGIN_PATH}?${new URLSearchParams({ next: pathname + search })}`;
  } else if (signedIn && isGuestOnlyPath(pathname)) {
    location = safeNextPath(request.nextUrl.searchParams.get("next") ?? HOME_AFTER_LOGIN);
  }
  if (!location) return response;

  // Keep any renewed session cookies on the redirect too.
  const redirect = NextResponse.redirect(new URL(location, request.url));
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Every page, except Next.js build files, the self-hosted fonts and image files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)"],
};
