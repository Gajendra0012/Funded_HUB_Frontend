/**
 * The admin app's settings (ADM-07).
 *
 * All three values are public: Next.js copies NEXT_PUBLIC_ values into the browser code at
 * build time, and only when each one is written out in full (process.env.NEXT_PUBLIC_…).
 * That's why readAdminEnv() lists them one by one. Never put a secret key here.
 *
 * The rules (https, publishable key only, …) are shared with the website: packages/config.
 * Local values: copy apps/admin/.env.example to apps/admin/.env.local.
 */
import { checkAddress, checkPublishableKey, isLocalAddress, settingsError, settingValue } from "@funded-hub/config";

export type AdminEnv = {
  /** Supabase project URL, e.g. http://127.0.0.1:54321 locally. */
  supabaseUrl: string;
  /** Supabase publishable key (sb_publishable_…). Safe in the browser. */
  supabasePublishableKey: string;
  /** Backend API address without a trailing slash, e.g. http://127.0.0.1:4000. */
  adminApiUrl: string;
};

export type RawAdminEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string | undefined;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string | undefined;
  NEXT_PUBLIC_ADMIN_API_URL: string | undefined;
};

export function readAdminEnv(): RawAdminEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL,
  };
}

/** Checks the settings and lists every problem. Pure (no process.env), so tests can call it directly. */
export function checkAdminEnv(raw: RawAdminEnv): { env?: AdminEnv; problems: string[] } {
  const problems: string[] = [];
  const supabaseUrl = checkAddress("NEXT_PUBLIC_SUPABASE_URL", settingValue(raw.NEXT_PUBLIC_SUPABASE_URL), problems);
  const supabasePublishableKey = checkPublishableKey("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", settingValue(raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), problems);
  const adminApiUrl = checkAddress("NEXT_PUBLIC_ADMIN_API_URL", settingValue(raw.NEXT_PUBLIC_ADMIN_API_URL), problems);

  if (problems.length || !supabaseUrl || !supabasePublishableKey || !adminApiUrl) return { problems };
  return { env: { supabaseUrl, supabasePublishableKey, adminApiUrl }, problems };
}

/**
 * The environment tag in the top bar: "Local" when the backend runs on this computer.
 * Every hosted backend is "Staging" for now; a production label comes with the first production setup.
 */
export function environmentLabel(adminApiUrl: string): "Local" | "Staging" {
  return isLocalAddress(adminApiUrl) ? "Local" : "Staging";
}

/** Returns the checked settings, or throws one clear error that lists every problem. */
export function assertAdminEnv(raw: RawAdminEnv = readAdminEnv()): AdminEnv {
  const { env, problems } = checkAdminEnv(raw);
  if (env) return env;
  throw settingsError(
    "Admin app settings are missing or wrong",
    problems,
    "Copy apps/admin/.env.example to apps/admin/.env.local and fill in the values (docs/ADMIN_BUILD_PLAN.md, ADM-07).",
  );
}
