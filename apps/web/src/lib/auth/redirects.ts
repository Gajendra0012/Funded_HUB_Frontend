/**
 * Where people go around sign-in, and which pages need it (WEB-10).
 * Pure functions (no browser, no network): the proxy, the auth pages and tests share them.
 */

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const RESET_PASSWORD_PATH = "/reset-password";
export const CALLBACK_PATH = "/auth/callback";
export const HOME_AFTER_LOGIN = "/dashboard";

/** Pages that need a signed-in trader. Everything else (website, legal, auth pages) is open. */
const PROTECTED_PREFIXES = ["/dashboard", "/checkout"];

/** Auth pages a signed-in trader doesn't need: they go to the dashboard instead. */
const GUEST_ONLY_PATHS = [LOGIN_PATH, SIGNUP_PATH];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.includes(pathname);
}

/**
 * Where to go after signing in. Only paths on this site ("/dashboard/payouts?tab=x"), never another
 * website ("//evil.example", "https://…", "/\\evil"), so a crafted link can't send a trader to a fake
 * page after login. Auth pages themselves fall back to the dashboard.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return HOME_AFTER_LOGIN;
  const base = "http://site.invalid";
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return HOME_AFTER_LOGIN;
  }
  if (url.origin !== base || isGuestOnlyPath(url.pathname) || url.pathname === CALLBACK_PATH) return HOME_AFTER_LOGIN;
  return url.pathname + url.search + url.hash;
}

/**
 * The address Supabase sends people back to after Google sign-in, an email-confirmation link or a
 * password-reset link. Built from the site's own address (NEXT_PUBLIC_SITE_URL), never the request.
 * It must be in Supabase's allowed redirect URLs.
 */
export function callbackUrl(siteUrl: string, next: string): string {
  return `${siteUrl}${CALLBACK_PATH}?next=${encodeURIComponent(safeNextPath(next))}`;
}
