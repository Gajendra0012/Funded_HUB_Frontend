/**
 * Reading the signed-in admin's session from the Supabase login token (JWT claims).
 *
 * Pure functions only (no browser, no network), so the proxy, the server and the
 * browser all use the same rules, and tests can check them directly.
 */

/** Admin sessions end this many hours after the password sign-in (sprint task AD1-07). */
export const ADMIN_SESSION_HOURS = 12;

/** The parts of the Supabase token this app uses. */
export type SessionClaims = {
  sub: string;
  email?: string;
  /** "aal2" once the 6-digit 2FA code was entered in this session. */
  aal?: string;
  /** How and when this session signed in, e.g. [{ method: "password", timestamp: … }, { method: "totp", … }]. */
  amr?: Array<{ method: string; timestamp?: number } | string>;
  /** Profile fields the user can change themselves: only for display, never for access decisions. */
  user_metadata?: Record<string, unknown>;
};

export type SessionState =
  /** No session at all. */
  | "signed-out"
  /** Password done, 2FA code still missing. */
  | "needs-2fa"
  /** Older than 12 hours, or the sign-in time can't be read (fail safe). */
  | "expired"
  /** Signed in with password and 2FA, within 12 hours. */
  | "active";

/**
 * When this session signed in (seconds since 1970), from the token's `amr` list:
 * the password step if present, otherwise the earliest step. Null if no time is given.
 */
export function sessionStartedAt(claims: SessionClaims): number | null {
  const entries = (claims.amr ?? []).filter(
    (entry): entry is { method: string; timestamp: number } => typeof entry === "object" && typeof entry.timestamp === "number",
  );
  if (!entries.length) return null;
  const password = entries.find((entry) => entry.method === "password");
  return password ? password.timestamp : Math.min(...entries.map((entry) => entry.timestamp));
}

/** When the 12-hour admin session ends (seconds since 1970), or null if the start is unknown. */
export function sessionExpiresAt(claims: SessionClaims): number | null {
  const started = sessionStartedAt(claims);
  return started === null ? null : started + ADMIN_SESSION_HOURS * 60 * 60;
}

/** The session's state at `nowSeconds`. Unknown sign-in time counts as expired: when unsure, sign out. */
export function sessionState(claims: SessionClaims | null, nowSeconds: number): SessionState {
  if (!claims) return "signed-out";
  const expiresAt = sessionExpiresAt(claims);
  if (expiresAt === null || nowSeconds >= expiresAt) return "expired";
  return claims.aal === "aal2" ? "active" : "needs-2fa";
}

/** "Local Admin" from the profile name, or the email if there's no name. */
export function displayName(claims: SessionClaims): string {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const name = `${text(claims.user_metadata?.first_name)} ${text(claims.user_metadata?.last_name)}`.trim();
  return name || claims.email || "Admin";
}

/** "LA" for "Local Admin", "AD" for "admin@example.com". */
export function initialsOf(name: string): string {
  const words = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "A").slice(0, 2);
  return letters.toUpperCase();
}
