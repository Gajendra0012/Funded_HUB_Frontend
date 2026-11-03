/**
 * The admin app's settings (ADM-07).
 *
 * All three values are public: Next.js copies NEXT_PUBLIC_ values into the browser code at
 * build time, and only when each one is written out in full (process.env.NEXT_PUBLIC_…).
 * That's why readAdminEnv() lists them one by one. Never put a secret key here.
 *
 * Local values: copy apps/admin/.env.example to apps/admin/.env.local.
 */

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

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Checks one address. Plain http is allowed only for this computer; anything else must use https. */
function checkUrl(name: string, value: string, problems: string[]): string | undefined {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    problems.push(`${name} is not a valid address: "${value}".`);
    return undefined;
  }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname))) {
    problems.push(`${name} must use https (plain http is only allowed for localhost / 127.0.0.1): "${value}".`);
    return undefined;
  }
  if (url.search || url.hash) {
    problems.push(`${name} must be a plain address without "?" or "#": "${value}".`);
    return undefined;
  }
  // Keep the path (a backend may sit under /something) but drop the trailing slash.
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}

/** Checks the settings and lists every problem. Pure (no process.env), so tests can call it directly. */
export function checkAdminEnv(raw: RawAdminEnv): { env?: AdminEnv; problems: string[] } {
  const problems: string[] = [];
  const value = (name: keyof RawAdminEnv) => raw[name]?.trim() ?? "";

  const supabaseUrlRaw = value("NEXT_PUBLIC_SUPABASE_URL");
  const keyRaw = value("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const apiUrlRaw = value("NEXT_PUBLIC_ADMIN_API_URL");

  const supabaseUrl = supabaseUrlRaw ? checkUrl("NEXT_PUBLIC_SUPABASE_URL", supabaseUrlRaw, problems) : undefined;
  if (!supabaseUrlRaw) problems.push("NEXT_PUBLIC_SUPABASE_URL is missing.");

  if (!keyRaw) {
    problems.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.");
  } else if (keyRaw.startsWith("sb_secret_")) {
    problems.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a SECRET key. Use the publishable key (sb_publishable_…); secret keys must never reach the browser.");
  } else if (!keyRaw.startsWith("sb_publishable_")) {
    problems.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable key (it starts with sb_publishable_).");
  }

  const adminApiUrl = apiUrlRaw ? checkUrl("NEXT_PUBLIC_ADMIN_API_URL", apiUrlRaw, problems) : undefined;
  if (!apiUrlRaw) problems.push("NEXT_PUBLIC_ADMIN_API_URL is missing.");

  if (problems.length || !supabaseUrl || !adminApiUrl) return { problems };
  return { env: { supabaseUrl, supabasePublishableKey: keyRaw, adminApiUrl }, problems };
}

/**
 * The environment tag in the top bar: "Local" when the backend runs on this computer.
 * Every hosted backend is "Staging" for now; a production label comes with the first production setup.
 */
export function environmentLabel(adminApiUrl: string): "Local" | "Staging" {
  return LOCAL_HOSTS.has(new URL(adminApiUrl).hostname) ? "Local" : "Staging";
}

/** Returns the checked settings, or throws one clear error that lists every problem. */
export function assertAdminEnv(raw: RawAdminEnv = readAdminEnv()): AdminEnv {
  const { env, problems } = checkAdminEnv(raw);
  if (env) return env;
  throw new Error(
    [
      "Admin app settings are missing or wrong:",
      ...problems.map((problem) => `  - ${problem}`),
      "Copy apps/admin/.env.example to apps/admin/.env.local and fill in the values (docs/ADMIN_BUILD_PLAN.md, ADM-07).",
    ].join("\n"),
  );
}
