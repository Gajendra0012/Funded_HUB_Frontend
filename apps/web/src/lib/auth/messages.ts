/**
 * What the trader sees when a Supabase Auth call fails (WEB-10).
 * Sign-in failures stay generic, so they never reveal whether an email has an account.
 */

type AuthErrorLike = { status?: number; code?: string; name?: string; message?: string } | null | undefined;

export const AUTH_MESSAGES = {
  badCredentials: "That email and password don't match. Try again or reset your password.",
  notConfirmed: "Confirm your email first. We sent you a link when you signed up.",
  emailTaken: "An account with this email may already exist. Log in or reset your password.",
  weakPassword: "Choose a stronger password: at least 8 characters with letters and numbers.",
  tooMany: "Too many attempts. Wait a few minutes, then try again.",
  unavailable: "Sign-in is unavailable right now. Try again in a moment.",
  linkExpired: "That link has expired or was already used. Request a new one.",
  googleFailed: "Google sign-in didn't finish. Try again.",
  generic: "Something went wrong. Try again.",
} as const;

/** No connection to Supabase, or a Supabase server error: worth trying again, not the trader's fault. */
export function isTemporaryAuthError(error: AuthErrorLike): boolean {
  return error?.name === "AuthRetryableFetchError" || error?.status === 0 || (error?.status !== undefined && error.status >= 500);
}

/** Turns a Supabase Auth error into one of the messages above. */
export function authErrorMessage(error: AuthErrorLike): string {
  if (!error) return AUTH_MESSAGES.generic;
  if (error.status === 429 || error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit") return AUTH_MESSAGES.tooMany;
  if (isTemporaryAuthError(error)) return AUTH_MESSAGES.unavailable;
  switch (error.code) {
    case "invalid_credentials":
      return AUTH_MESSAGES.badCredentials;
    case "email_not_confirmed":
      return AUTH_MESSAGES.notConfirmed;
    case "user_already_exists":
    case "email_exists":
      return AUTH_MESSAGES.emailTaken;
    case "weak_password":
      return AUTH_MESSAGES.weakPassword;
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
      return AUTH_MESSAGES.linkExpired;
    default:
      return error.status === 400 ? AUTH_MESSAGES.badCredentials : AUTH_MESSAGES.generic;
  }
}

/** Messages for /login?error=… (set by /auth/callback when a link or Google sign-in fails). */
export function loginNotice(code: string | null): string | null {
  if (code === "link") return AUTH_MESSAGES.linkExpired;
  if (code === "google") return AUTH_MESSAGES.googleFailed;
  if (code === "unavailable") return AUTH_MESSAGES.unavailable;
  return null;
}
