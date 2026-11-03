import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertAdminEnv } from "./env";

let client: SupabaseClient | undefined;

/**
 * The Supabase client for the browser (login, 2FA, sign out).
 * It keeps the session in cookies, so the server and src/proxy.ts can read the same session.
 * Uses only the publishable key; secret keys never reach the browser.
 */
export function getBrowserSupabase(): SupabaseClient {
  if (!client) {
    const env = assertAdminEnv();
    client = createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
  }
  return client;
}
