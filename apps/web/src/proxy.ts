import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { assertWebEnv } from "@/config/env";

/**
 * Runs before every page of the website (WEB-04) and keeps the Supabase login session fresh:
 * when the login token is about to expire, Supabase renews it here and the new cookies go back to
 * the browser (Server Components can't set cookies themselves).
 *
 * No page protection yet. That comes with the real login (WO-4, WEB-10).
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
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  // Every page, except Next.js build files, the self-hosted fonts and image files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)"],
};
