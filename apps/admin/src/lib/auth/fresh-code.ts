import { getBrowserSupabase } from "@/lib/supabase/browser";
import { loginErrorMessage } from "./login-step";

/** A 6-digit code from the authenticator app. */
export const CODE_PATTERN = /^\d{6}$/;

export const NO_AUTHENTICATOR = "No authenticator is set up for this account. Sign out and sign in again to set one up.";

/**
 * Checks a 6-digit code from the signed-in admin's authenticator app with Supabase (a new challenge,
 * then verify). Used by the 2FA prompt (MFA_REQUIRED, ADM-09) and before every sensitive change (ADM-19).
 *
 * The backend doesn't check yet that a fresh code came before a change (gap G4), so this stops a
 * change from an unattended browser, not a direct API call.
 */
export async function verifyFreshCode(code: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const mfa = getBrowserSupabase().auth.mfa;
  const { data: factors, error: listError } = await mfa.listFactors();
  // `totp` lists only verified authenticators.
  const factor = factors?.totp[0];
  if (listError) return { ok: false, message: loginErrorMessage(listError, "credentials") };
  if (!factor) return { ok: false, message: NO_AUTHENTICATOR };
  const { error } = await mfa.challengeAndVerify({ factorId: factor.id, code });
  return error ? { ok: false, message: loginErrorMessage(error, "code") } : { ok: true };
}
