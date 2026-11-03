/**
 * The trader website's settings (WEB-03).
 *
 * All four values are public: Next.js copies NEXT_PUBLIC_ values into the browser code at build
 * time, and only when each one is written out in full (process.env.NEXT_PUBLIC_…). That's why
 * readWebEnv() lists them one by one. Never put a secret key here.
 *
 * The rules (https, publishable key only, …) are shared with the admin app: packages/config.
 * Local values: copy apps/web/.env.example to apps/web/.env.local.
 */
import { checkAddress, checkPublishableKey, settingsError, settingValue } from "@funded-hub/config";

export type WebEnv = {
  /** Supabase project URL, e.g. http://127.0.0.1:54321 locally. */
  supabaseUrl: string;
  /** Supabase publishable key (sb_publishable_…). Safe in the browser. */
  supabasePublishableKey: string;
  /** Backend API address without a trailing slash, e.g. http://127.0.0.1:4000. */
  apiUrl: string;
  /** This site's own address (no path), e.g. http://127.0.0.1:3000. Email links are built from it. */
  siteUrl: string;
};

export type RawWebEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string | undefined;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string | undefined;
  NEXT_PUBLIC_API_URL: string | undefined;
  NEXT_PUBLIC_SITE_URL: string | undefined;
};

export function readWebEnv(): RawWebEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

/** Checks the settings and lists every problem. Pure (no process.env), so tests can call it directly. */
export function checkWebEnv(raw: RawWebEnv): { env?: WebEnv; problems: string[] } {
  const problems: string[] = [];
  const supabaseUrl = checkAddress("NEXT_PUBLIC_SUPABASE_URL", settingValue(raw.NEXT_PUBLIC_SUPABASE_URL), problems);
  const supabasePublishableKey = checkPublishableKey("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", settingValue(raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), problems);
  const apiUrl = checkAddress("NEXT_PUBLIC_API_URL", settingValue(raw.NEXT_PUBLIC_API_URL), problems);
  const siteUrl = checkAddress("NEXT_PUBLIC_SITE_URL", settingValue(raw.NEXT_PUBLIC_SITE_URL), problems, { originOnly: true });

  if (problems.length || !supabaseUrl || !supabasePublishableKey || !apiUrl || !siteUrl) return { problems };
  return { env: { supabaseUrl, supabasePublishableKey, apiUrl, siteUrl }, problems };
}

/** Returns the checked settings, or throws one clear error that lists every problem. */
export function assertWebEnv(raw: RawWebEnv = readWebEnv()): WebEnv {
  const { env, problems } = checkWebEnv(raw);
  if (env) return env;
  throw settingsError(
    "Website settings are missing or wrong",
    problems,
    "Copy apps/web/.env.example to apps/web/.env.local and fill in the values (docs/WEB_BUILD_PLAN.md, WEB-03).",
  );
}
