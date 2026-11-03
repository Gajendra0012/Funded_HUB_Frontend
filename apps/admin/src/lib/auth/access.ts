/**
 * Page protection rules (ADM-16), used by src/proxy.ts on every request.
 *
 * Only /login is open. Every other admin page needs an "active" session:
 * password + 2FA code, signed in less than 12 hours ago (see claims.ts).
 * The backend checks the same session again on every API call.
 */
import { sessionState, type SessionClaims } from "./claims";

export const LOGIN_PATH = "/login";

export type AccessDecision = {
  /** "allow" = show the page; "redirect" = send the browser to `location`. */
  action: "allow" | "redirect";
  location?: string;
  /** Clear the session cookies first (the session is too old to keep). */
  signOut: boolean;
};

/**
 * Where to go after signing in. Only paths on this site are allowed ("/traders?status=x"),
 * never another website ("//evil.example", "https://…"), so a crafted link can't redirect
 * an admin to a fake page after login.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  const base = "http://admin.invalid";
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return "/";
  }
  if (url.origin !== base || url.pathname === LOGIN_PATH) return "/";
  return url.pathname + url.search + url.hash;
}

export function decideAccess(input: {
  pathname: string;
  /** The query string, including "?" (or ""). */
  search: string;
  claims: SessionClaims | null;
  nowSeconds: number;
}): AccessDecision {
  const state = sessionState(input.claims, input.nowSeconds);

  if (input.pathname === LOGIN_PATH) {
    // Already fully signed in: skip the login page.
    if (state === "active") {
      const next = new URLSearchParams(input.search).get("next");
      return { action: "redirect", location: safeNextPath(next), signOut: false };
    }
    // Too old: clear it and show the login form. Half-done sign-in ("needs-2fa"): the form resumes at the code.
    return { action: "allow", signOut: state === "expired" };
  }

  if (state === "active") return { action: "allow", signOut: false };
  if (state === "expired") return { action: "redirect", location: `${LOGIN_PATH}?reason=expired`, signOut: true };

  // Signed out, or the 2FA code is still missing: log in, then come back here.
  const next = new URLSearchParams({ next: input.pathname + input.search });
  return { action: "redirect", location: `${LOGIN_PATH}?${next}`, signOut: false };
}
