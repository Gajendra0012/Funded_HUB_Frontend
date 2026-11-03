"use client";

import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CodeInput, CopyButton, Stepper } from "@funded-hub/ui";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { groupSecret, loginErrorMessage, loginNotice, nextLoginStep, qrImageSource, type LoginStep } from "@/lib/auth/login-step";
import { Brand } from "./brand";

/*
 * Admin sign-in with mandatory 2FA (ADM-12 – ADM-14), using Supabase Auth.
 *
 *   1. Email + password.
 *   2a. First login: set up an authenticator app (QR code or key) and confirm with a 6-digit code.
 *   2b. Later logins: enter the 6-digit code.
 *   3. Done (session level "aal2"): go to the page the admin asked for.
 *
 * There is no way to skip step 2: src/proxy.ts and the backend refuse sessions without the code.
 */

type Enrollment = { factorId: string; qrCode: string; secret: string };

const ENROLL_NAME = "Funded HUB Admin";
const CODE_PATTERN = /^\d{6}$/;

export function LoginFlow({ next, reason }: { next: string; reason: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep | "loading">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [verifyFactorId, setVerifyFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  /** Looks at the current session and works out the next step (also after a reload mid-login). */
  async function continueLogin() {
    const supabase = getBrowserSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setStep("credentials");
      return;
    }
    const [{ data: level, error: levelError }, { data: factors, error: factorsError }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);
    // Don't guess when the 2FA status can't be read (for example, no connection): a wrong guess
    // would start a new 2FA setup for an admin who already has one.
    if (levelError || factorsError) {
      setError(loginErrorMessage(levelError ?? factorsError, "credentials"));
      setStep("credentials");
      return;
    }
    const verified = factors?.totp ?? [];
    const nextStep = nextLoginStep({
      signedIn: true,
      currentLevel: level?.currentLevel ?? null,
      verifiedTotpFactorIds: verified.map((factor) => factor.id),
    });

    if (nextStep === "done") {
      router.replace(next);
      router.refresh();
      return;
    }
    if (nextStep === "verify") {
      setVerifyFactorId(verified[0].id);
      setCode("");
      setStep("verify");
      return;
    }
    await startEnrollment();
  }

  /** First login: create a new authenticator setup (QR code + key). */
  async function startEnrollment() {
    const supabase = getBrowserSupabase();
    // Remove unfinished setups from earlier attempts, so the new one can use the same name.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const factor of factors?.all ?? []) {
      if (factor.factor_type === "totp" && factor.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: ENROLL_NAME, issuer: ENROLL_NAME });
    if (enrollError || !data) {
      setError(loginErrorMessage(enrollError, "credentials"));
      setStep("credentials");
      return;
    }
    setEnrollment({ factorId: data.id, qrCode: qrImageSource(data.totp.qr_code), secret: data.totp.secret });
    setCode("");
    setStep("enroll");
  }

  // On first load, resume any half-finished sign-in (for example after a page reload).
  // The ref stops React's development double-run from starting two 2FA setups at once.
  const resumed = useRef(false);
  const resumeLogin = useEffectEvent(() => {
    void continueLogin();
  });
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    resumeLogin();
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    const { error: signInError } = await getBrowserSupabase().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setError(loginErrorMessage(signInError, "credentials"));
      setBusy(false);
      return;
    }
    await continueLogin();
    setBusy(false);
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const factorId = step === "enroll" ? enrollment?.factorId : verifyFactorId;
    if (!factorId || !CODE_PATTERN.test(code)) return;
    setBusy(true);
    setError("");
    const { error: verifyError } = await getBrowserSupabase().auth.mfa.challengeAndVerify({ factorId, code });
    if (verifyError) {
      setError(loginErrorMessage(verifyError, "code"));
      setCode("");
      setBusy(false);
      return;
    }
    // The session is now "aal2": password and code. Go to the requested page.
    router.replace(next);
    router.refresh();
  }

  async function useAnotherAccount() {
    setBusy(true);
    await getBrowserSupabase().auth.signOut({ scope: "local" });
    setEnrollment(null);
    setVerifyFactorId(null);
    setCode("");
    setError("");
    setStep("credentials");
    setBusy(false);
  }

  const secondStepLabel = step === "enroll" ? "Set up 2FA" : "2FA code";
  const stepIndex = step === "credentials" || step === "loading" ? 0 : 1;
  const notice = loginNotice(reason);

  return (
    <section className="login-card login-flow" aria-busy={step === "loading" || busy}>
      <Brand />
      <span className="eyebrow">OPERATIONS WORKSPACE</span>
      <h1>
        Admin sign-in.
        <br />
        <em>A clearer perspective.</em>
      </h1>
      <Stepper steps={["Password", secondStepLabel]} current={stepIndex} />

      {notice && step === "credentials" && !error && (
        <p className="inline-alert" role="status" data-testid="login-notice" data-reason={reason}>
          {notice}
        </p>
      )}
      {error && (
        <p className="inline-alert" role="alert" data-testid="login-error">
          {error}
        </p>
      )}

      {step === "loading" && <p className="small-note">Checking your session…</p>}

      {step === "credentials" && (
        <form className="ops-form" onSubmit={signIn} data-testid="login-form">
          <label>
            Work email
            <input name="email" type="email" autoComplete="username" spellCheck={false} required placeholder="you@example.com" data-testid="login-email" />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required placeholder="Your password" data-testid="login-password" />
          </label>
          <button className="ui-primary" type="submit" disabled={busy} data-testid="login-submit">
            {busy ? "Signing in…" : "Continue →"}
          </button>
        </form>
      )}

      {step === "enroll" && enrollment && (
        <div className="ops-form" data-testid="enroll-step">
          <h2>Set up two-factor authentication</h2>
          <p>
            2FA is required for every admin. Scan this QR code with an authenticator app (Google Authenticator, Microsoft
            Authenticator, 1Password…), then enter the 6-digit code it shows.
          </p>
          {/* A data: image can't use next/image; it's a small generated SVG. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="qr-code" src={enrollment.qrCode} alt="QR code to add Funded HUB Admin to your authenticator app" width={184} height={184} data-testid="enroll-qr" />
          <div className="manual-key">
            <span>Can’t scan? Enter this key in the app:</span>
            <code data-testid="enroll-secret">{groupSecret(enrollment.secret)}</code>
            <CopyButton value={enrollment.secret} label="Copy key" testId="enroll-copy-key" />
          </div>
          <form onSubmit={submitCode} data-testid="enroll-form">
            <CodeInput value={code} onChange={setCode} label="6-digit code from your app" testId="enroll-code" />
            <button className="ui-primary" type="submit" disabled={busy || !CODE_PATTERN.test(code)} data-testid="enroll-submit">
              {busy ? "Checking…" : "Turn on 2FA and continue →"}
            </button>
          </form>
          <button type="button" onClick={useAnotherAccount} disabled={busy} data-testid="login-other-account">
            Use a different account
          </button>
        </div>
      )}

      {step === "verify" && (
        <div className="ops-form" data-testid="verify-step">
          <h2>Enter your 2FA code</h2>
          <p>Open your authenticator app and enter the 6-digit code for Funded HUB Admin.</p>
          <form onSubmit={submitCode} data-testid="verify-form">
            <CodeInput value={code} onChange={setCode} label="6-digit code from your app" testId="verify-code" />
            <button className="ui-primary" type="submit" disabled={busy || !CODE_PATTERN.test(code)} data-testid="verify-submit">
              {busy ? "Checking…" : "Sign in →"}
            </button>
          </form>
          <button type="button" onClick={useAnotherAccount} disabled={busy} data-testid="login-other-account">
            Use a different account
          </button>
        </div>
      )}

      <p className="small-note">Admin access only. Every sign-in needs your password and a 2FA code.</p>
    </section>
  );
}
