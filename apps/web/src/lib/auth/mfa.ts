/**
 * Two-factor authentication for traders (WEB-11), with Supabase Auth TOTP (authenticator apps).
 *
 * Optional, turned on in Dashboard → Settings → Security. Once on, every sign-in (password or Google)
 * reaches only level "aal1" until the 6-digit code is entered ("aal2"); src/proxy.ts keeps the
 * dashboard closed until then.
 */
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { authErrorMessage } from "./messages";

export const CODE_PATTERN = /^\d{6}$/;
const FACTOR_NAME = "Funded HUB";

type Failure = { ok: false; message: string };

/** The id of the trader's verified authenticator, or null if 2FA is off. */
export async function verifiedFactorId(): Promise<string | null> {
  const { data, error } = await getBrowserSupabase().auth.mfa.listFactors();
  if (error) throw error;
  // `totp` lists only verified authenticators.
  return data?.totp[0]?.id ?? null;
}

/** True when this session still needs the 2FA code: the trader has 2FA on, but only signed in with a password/Google. */
export async function needsSecondFactor(): Promise<boolean> {
  const { data, error } = await getBrowserSupabase().auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return data?.nextLevel === "aal2" && data.currentLevel !== "aal2";
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

/** Step 1 of turning 2FA on: a new authenticator setup (QR code + key). Unfinished earlier setups are removed first. */
export async function startEnrollment(): Promise<{ ok: true; factorId: string; qr: string; secret: string } | Failure> {
  const mfa = getBrowserSupabase().auth.mfa;
  const { data: factors } = await mfa.listFactors();
  for (const factor of factors?.all ?? []) {
    if (factor.factor_type === "totp" && factor.status === "unverified") await mfa.unenroll({ factorId: factor.id });
  }
  const { data, error } = await mfa.enroll({ factorType: "totp", friendlyName: FACTOR_NAME, issuer: FACTOR_NAME });
  if (error || !data) return { ok: false, message: authErrorMessage(error) };
  return { ok: true, factorId: data.id, qr: qrImageSource(data.totp.qr_code), secret: data.totp.secret };
}

/** Checks a 6-digit code against an authenticator (a new challenge, then verify). Used to finish setup, to sign in, and to turn 2FA off. */
export async function verifyCode(factorId: string, code: string): Promise<{ ok: true } | Failure> {
  const { error } = await getBrowserSupabase().auth.mfa.challengeAndVerify({ factorId, code });
  if (!error) return { ok: true };
  const wrong = error.code === "mfa_verification_failed" || error.status === 422 || error.status === 400;
  return { ok: false, message: wrong ? "That code didn't work. Enter the newest 6-digit code from your authenticator app." : authErrorMessage(error) };
}

/** The sign-in step: checks the code against the trader's verified authenticator. */
export async function verifySignInCode(code: string): Promise<{ ok: true } | Failure> {
  const factorId = await verifiedFactorId();
  if (!factorId) return { ok: true };
  return verifyCode(factorId, code);
}

/** Turns 2FA off. Supabase only allows it after a fresh code (level aal2), so the code is checked first. */
export async function disableTwoFactor(code: string): Promise<{ ok: true } | Failure> {
  const factorId = await verifiedFactorId();
  if (!factorId) return { ok: true };
  const checked = await verifyCode(factorId, code);
  if (!checked.ok) return checked;
  const { error } = await getBrowserSupabase().auth.mfa.unenroll({ factorId });
  return error ? { ok: false, message: authErrorMessage(error) } : { ok: true };
}
