import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertWebEnv } from "@/config/env";

/**
 * The Supabase client for server code (layouts, pages, route handlers).
 * It reads the session from the request's cookies. Check the login with `auth.getClaims()`,
 * which verifies the token's signature; never trust `auth.getSession()` on the server.
 */
export async function getServerSupabase() {
  const env = assertWebEnv();
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies. That's fine: src/proxy.ts keeps the session fresh.
        }
      },
    },
  });
}
