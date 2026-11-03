/**
 * Settings rules shared by the Funded HUB apps (admin: ADM-07, website: WEB-03).
 *
 * Each app lists its own settings in its `src/config/env.ts` (Next.js copies a NEXT_PUBLIC_ value
 * into the browser code only when it is written out in full) and checks them with these rules.
 * Pure functions only (no process.env), so each app's checker and its tests can call them directly.
 *
 * One file on purpose: both apps' next.config.ts load it at startup, before any bundler runs.
 */

/** Addresses on this computer: the only ones allowed over plain http. */
export const LOCAL_HOSTS: ReadonlySet<string> = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** True when the address points at this computer (localhost, 127.0.0.1 or [::1]). */
export function isLocalAddress(address: string): boolean {
  return LOCAL_HOSTS.has(new URL(address).hostname);
}

/** A setting's value with surrounding spaces removed; "" when it is missing. */
export function settingValue(value: string | undefined): string {
  return value?.trim() ?? "";
}

/**
 * Checks one address setting. Returns it without a trailing slash, or undefined after adding the
 * problem to `problems`. Plain http is allowed only for this computer; anything else must use https.
 * `originOnly` also refuses a path: for a site's own address, which email links are built from.
 */
export function checkAddress(name: string, value: string, problems: string[], options: { originOnly?: boolean } = {}): string | undefined {
  if (!value) {
    problems.push(`${name} is missing.`);
    return undefined;
  }
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
  if (options.originOnly && url.pathname !== "/") {
    problems.push(`${name} must be just the site's address, without a path: "${value}".`);
    return undefined;
  }
  // Keep the path (a backend may sit under /something) but drop the trailing slash.
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}

/**
 * Checks a Supabase publishable key (sb_publishable_…). A secret key (sb_secret_…) is refused
 * with its own message: NEXT_PUBLIC_ values end up in the browser, where a secret key must never be.
 */
export function checkPublishableKey(name: string, value: string, problems: string[]): string | undefined {
  if (!value) {
    problems.push(`${name} is missing.`);
    return undefined;
  }
  if (value.startsWith("sb_secret_")) {
    problems.push(`${name} holds a SECRET key. Use the publishable key (sb_publishable_…); secret keys must never reach the browser.`);
    return undefined;
  }
  if (!value.startsWith("sb_publishable_")) {
    problems.push(`${name} must be a publishable key (it starts with sb_publishable_).`);
    return undefined;
  }
  return value;
}

/** One clear error that lists every problem, then how to fix them. */
export function settingsError(title: string, problems: readonly string[], fix: string): Error {
  return new Error([`${title}:`, ...problems.map((problem) => `  - ${problem}`), fix].join("\n"));
}
