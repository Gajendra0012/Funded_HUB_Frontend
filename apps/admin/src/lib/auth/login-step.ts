/**
 * Which login step to show (ADM-12 – ADM-14).
 *
 *   no session                     → "credentials"  (email + password)
 *   password done, no authenticator → "enroll"      (first login: set up 2FA, can't be skipped)
 *   password done, authenticator   → "verify"       (enter the 6-digit code)
 *   2FA code done (aal2)            → "done"
 */
export type LoginStep = "credentials" | "enroll" | "verify" | "done";

export function nextLoginStep(state: {
  signedIn: boolean;
  /** The session's current level: "aal1" after the password, "aal2" after the 2FA code. */
  currentLevel: string | null;
  /** IDs of the admin's verified TOTP authenticators. */
  verifiedTotpFactorIds: string[];
}): LoginStep {
  if (!state.signedIn) return "credentials";
  if (state.currentLevel === "aal2") return "done";
  return state.verifiedTotpFactorIds.length ? "verify" : "enroll";
}

/** Messages shown on the login page. Sign-in failures are always generic, so they don't reveal which part was wrong. */
export const LOGIN_MESSAGES = {
  generic: "We couldn't sign you in. Check your email and password and try again.",
  tooMany: "Too many attempts. Wait a few minutes, then try again.",
  wrongCode: "That code didn't work. Enter the newest 6-digit code from your authenticator app.",
  expired: "Your admin session ended after 12 hours. Please sign in again.",
  noAccess: "This account doesn't have admin access. Sign in with an admin account.",
  ended: "Your session has ended. Please sign in again.",
  unavailable: "Sign-in is unavailable right now. Try again in a moment.",
} as const;

/** The note above the login form for /login?reason=…, or null for no (or an unknown) reason. */
export function loginNotice(reason: string | null): string | null {
  if (reason === "expired") return LOGIN_MESSAGES.expired;
  if (reason === "no-access") return LOGIN_MESSAGES.noAccess;
  if (reason === "ended") return LOGIN_MESSAGES.ended;
  return null;
}

/** No connection to Supabase (it reports status 0) or a Supabase server error: worth trying again, and not the admin's fault. */
export function isTemporaryAuthError(error: { status?: number; name?: string } | null | undefined): boolean {
  return error?.name === "AuthRetryableFetchError" || error?.status === 0 || (error?.status !== undefined && error.status >= 500);
}

/** Turns a Supabase auth error into one of the messages above. */
export function loginErrorMessage(error: { status?: number; code?: string; name?: string } | null, step: "credentials" | "code"): string {
  if (error?.status === 429 || error?.code === "over_request_rate_limit") return LOGIN_MESSAGES.tooMany;
  if (isTemporaryAuthError(error)) return LOGIN_MESSAGES.unavailable;
  return step === "code" ? LOGIN_MESSAGES.wrongCode : LOGIN_MESSAGES.generic;
}

/**
 * Supabase returns the QR code as "data:image/svg+xml;utf-8,<svg …>" with the SVG unencoded.
 * A "#" inside the SVG would cut the address short, so the SVG is re-encoded.
 */
export function qrImageSource(qrCode: string): string {
  const svg = qrCode.replace(/^data:image\/svg\+xml;[^,]*,/, "");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** "JBSWY3DPEHPK3PXP" → "JBSW Y3DP EHPK 3PXP", easier to type by hand. */
export function groupSecret(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}
