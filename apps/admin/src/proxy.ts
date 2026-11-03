import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { assertAdminEnv } from "@/config/env";
import { decideAccess, LOGIN_PATH } from "@/lib/auth/access";
import type { SessionClaims } from "@/lib/auth/claims";

/**
 * Runs before every admin page (ADM-16).
 *  1. Keeps the Supabase session fresh (renews the login token when it's about to expire).
 *  2. Sends anyone without an active session (password + 2FA code, under 12 hours) to /login.
 *
 * This is the quick first check. src/lib/auth/session.ts checks again on the server, and the
 * backend checks the session and the admin's permission on every API call.
 */
export async function proxy(request: NextRequest) {
  const env = assertAdminEnv();
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

  // Verifies the token's signature (renewing it first if needed). Keep this right after creating
  // the client: code in between could act on a stale session.
  const { data } = await supabase.auth.getClaims();
  const claims = (data?.claims ?? null) as SessionClaims | null;

  const decision = decideAccess({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    claims,
    nowSeconds: Math.floor(Date.now() / 1000),
  });

  // A session older than 12 hours is ended for good, not just hidden.
  if (decision.signOut) await supabase.auth.signOut({ scope: "local" });
  if (decision.action === "allow") return response;

  const redirect = NextResponse.redirect(new URL(decision.location ?? LOGIN_PATH, request.url));
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header);
    if (value) redirect.headers.set(header, value);
  }
  return redirect;
}

export const config = {
  // Every page, except Next.js build files and public images and videos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|video/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)"],
};
