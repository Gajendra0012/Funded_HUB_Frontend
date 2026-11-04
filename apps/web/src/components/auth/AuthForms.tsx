"use client";

/*
 * Trader sign-in and sign-up (WEB-10, WEB-11), with Supabase Auth.
 *
 *   Log in:  email + password, or Google  →  6-digit 2FA code (only if the trader turned 2FA on)  →  dashboard
 *   Sign up: name, email, password, country, terms  →  "check your email" (confirmation link)  →  dashboard
 *            or Google (no email to confirm)
 *
 * Links in emails and Google come back through /auth/callback. src/proxy.ts keeps the dashboard
 * closed until the sign-in is complete (including the 2FA code).
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck, ShieldCheck, User } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Toggle";
import { assertWebEnv } from "@/config/env";
import { COUNTRIES, flag } from "@/data/countries";
import { identityFromUser, splitName } from "@/lib/auth/identity";
import { AUTH_MESSAGES, authErrorMessage, loginNotice } from "@/lib/auth/messages";
import { CODE_PATTERN, needsSecondFactor, verifySignInCode } from "@/lib/auth/mfa";
import { callbackUrl, HOME_AFTER_LOGIN, RESET_PASSWORD_PATH, safeNextPath } from "@/lib/auth/redirects";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { toast } from "@/lib/toast";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

function PasswordInput({ id, value, onChange, invalid, autoComplete }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <Input
      id={id}
      type={show ? "text" : "password"}
      autoComplete={autoComplete}
      placeholder="••••••••"
      value={value}
      invalid={invalid}
      icon={<Lock />}
      onChange={(e) => onChange(e.target.value)}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-fg"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Alert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "info" }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("mt-5 rounded-xl border px-3.5 py-2.5 text-sm", tone === "error" ? "border-loss/30 bg-loss/10 text-loss" : "border-line bg-white/[0.03] text-muted")}>
      {children}
    </p>
  );
}

/** "Continue with Google": Supabase sends the trader to Google, then back through /auth/callback. */
function GoogleButton({ next, label }: { next: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = async () => {
    setBusy(true);
    setError(null);
    const { error: oauthError } = await getBrowserSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl(assertWebEnv().siteUrl, next) },
    });
    // On success the browser is already on its way to Google.
    if (oauthError) {
      setError(authErrorMessage(oauthError));
      setBusy(false);
    }
  };
  return (
    <>
      <Button onClick={start} variant="secondary" size="lg" fullWidth className="mt-7" loading={busy} iconLeft={busy ? undefined : <GoogleMark />}>
        {label}
      </Button>
      {error && <Alert>{error}</Alert>}
    </>
  );
}

/** Puts the signed-in trader into the dashboard's store, then opens the requested page. */
async function enterDashboard(router: ReturnType<typeof useRouter>, next: string) {
  const { data } = await getBrowserSupabase().auth.getUser();
  if (data.user) useDemoStore.getState().login(identityFromUser(data.user));
  router.replace(next);
  router.refresh();
}

/* ───────────── Log in ───────────── */

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [step, setStep] = useState<"loading" | "credentials" | "code">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string }>({});
  const [alert, setAlert] = useState<{ text: string; tone: "error" | "info"; resend?: boolean } | null>(() => {
    const notice = loginNotice(params.get("error"));
    return notice ? { text: notice, tone: "error" } : null;
  });
  const [loading, setLoading] = useState(false);

  // Coming back from Google (or a reload) with 2FA still to do: resume at the code step.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    void (async () => {
      const { data } = await getBrowserSupabase().auth.getSession();
      if (data.session && (await needsSecondFactor().catch(() => false))) setStep("code");
      else setStep("credentials");
    })();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!EMAIL.test(email.trim())) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (errs.email || errs.password) return;
    setLoading(true);
    setAlert(null);
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setAlert({ text: authErrorMessage(error), tone: "error", resend: error.code === "email_not_confirmed" });
      setLoading(false);
      return;
    }
    if (await needsSecondFactor().catch(() => false)) {
      setStep("code");
      setLoading(false);
      return;
    }
    toast.success("Welcome back", "You're signed in.");
    await enterDashboard(router, next);
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      setErrors({ code: "Enter the 6-digit code from your authenticator app." });
      return;
    }
    setLoading(true);
    const result = await verifySignInCode(code);
    if (!result.ok) {
      setErrors({ code: result.message });
      setCode("");
      setLoading(false);
      return;
    }
    toast.success("Welcome back", "You're signed in.");
    await enterDashboard(router, next);
  };

  const forgotPassword = async () => {
    if (!EMAIL.test(email.trim())) {
      setErrors((x) => ({ ...x, email: "Enter your email first to reset your password." }));
      return;
    }
    const { error } = await getBrowserSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl(assertWebEnv().siteUrl, RESET_PASSWORD_PATH),
    });
    // Same answer whether or not the email has an account.
    if (error && error.status !== 400) setAlert({ text: authErrorMessage(error), tone: "error" });
    else setAlert({ text: `If ${email.trim()} has an account, a reset link is on its way.`, tone: "info" });
  };

  const resendConfirmation = async () => {
    const { error } = await getBrowserSupabase().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(assertWebEnv().siteUrl, next) },
    });
    setAlert(error ? { text: authErrorMessage(error), tone: "error" } : { text: `A new confirmation link was sent to ${email.trim()}.`, tone: "info" });
  };

  const useAnotherAccount = async () => {
    await getBrowserSupabase().auth.signOut({ scope: "local" });
    setCode("");
    setErrors({});
    setStep("credentials");
  };

  if (step === "loading") {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  if (step === "code") {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Enter your 2FA code</h1>
        <p className="mt-2 text-sm text-muted">Open your authenticator app and enter the 6-digit code for Funded HUB.</p>
        <form onSubmit={submitCode} noValidate className="mt-7 space-y-4">
          <Field label="6-digit code" htmlFor="login-code" error={errors.code}>
            <Input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="123 456"
              value={code}
              invalid={!!errors.code}
              icon={<ShieldCheck />}
              className="num text-lg tracking-[0.3em]"
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setErrors({});
              }}
            />
          </Field>
          <Button type="submit" size="lg" fullWidth loading={loading} disabled={!CODE_PATTERN.test(code)} iconRight={loading ? undefined : <ArrowRight className="size-4" />}>
            {loading ? "Checking…" : "Verify and continue"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          <button type="button" onClick={useAnotherAccount} className="font-medium text-fg hover:text-accent-1">
            Use a different account
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Log in to track your accounts, objectives and rewards.</p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GoogleButton next={next} label="Continue with Google" />
      </motion.div>

      {alert && (
        <Alert tone={alert.tone}>
          {alert.text}
          {alert.resend && (
            <>
              {" "}
              <button type="button" onClick={resendConfirmation} className="font-medium underline">
                Send a new link
              </button>
            </>
          )}
        </Alert>
      )}

      <Divider />

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="login-email" error={errors.email}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail />}
            value={email}
            invalid={!!errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((x) => ({ ...x, email: undefined }));
            }}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="login-password"
          error={errors.password}
          aside={
            <button type="button" className="text-xs font-medium text-accent-2 hover:underline" onClick={forgotPassword}>
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={password}
            invalid={!!errors.password}
            onChange={(v) => {
              setPassword(v);
              setErrors((x) => ({ ...x, password: undefined }));
            }}
          />
        </Field>
        <Button type="submit" variant="secondary" size="lg" fullWidth loading={loading} iconRight={!loading ? <ArrowRight className="size-4" /> : undefined}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to the platform?{" "}
        <Link href="/signup" className="font-medium text-fg hover:text-accent-1">
          Create an account
        </Link>
      </p>
    </div>
  );
}

/* ───────────── Sign up ───────────── */

function strength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "Use 8+ characters with a mix of letters, numbers and symbols" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.max(1, Math.min(4, s - (pw.length < 8 ? 1 : 0))) as 1 | 2 | 3 | 4;
  return { score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
}

const BAR = ["", "bg-loss", "bg-warning", "bg-accent-2", "bg-gradient-brand"];
const TXT = ["text-muted", "text-loss", "text-warning", "text-accent-2", "text-accent-1"];

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const st = strength(password);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string | undefined> = {};
    if (name.trim().length < 2) errs.name = "Enter your full name.";
    if (!EMAIL.test(email.trim())) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    if (!country) errs.country = "Select your country.";
    if (!terms) errs.terms = "Please accept the terms to continue.";
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    setAlert(null);
    const { data, error } = await getBrowserSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Read by the database when the account is created (profiles.first_name / last_name).
        data: { ...splitName(name), country_code: country, terms_accepted_at: new Date().toISOString() },
        emailRedirectTo: callbackUrl(assertWebEnv().siteUrl, HOME_AFTER_LOGIN),
      },
    });
    setLoading(false);
    if (error) {
      setAlert(authErrorMessage(error));
      return;
    }
    // Email confirmation off in Supabase: the account is ready and signed in.
    if (data.session) {
      toast.success("Account created", "Welcome to Funded HUB — pick your first challenge any time.");
      await enterDashboard(router, HOME_AFTER_LOGIN);
      return;
    }
    // Otherwise a confirmation link was sent. (For an email that already has an account Supabase
    // answers the same way, so this page never reveals who is registered.)
    setSentTo(email.trim());
  };

  const resend = async () => {
    if (!sentTo) return;
    const { error } = await getBrowserSupabase().auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: callbackUrl(assertWebEnv().siteUrl, HOME_AFTER_LOGIN) },
    });
    if (error) toast.error("Couldn't send the link", authErrorMessage(error));
    else toast.success("Link sent", `A new confirmation link is on its way to ${sentTo}.`);
  };

  if (sentTo) {
    return (
      <div>
        <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.05] text-accent-1">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a confirmation link to <span className="font-medium text-fg">{sentTo}</span>. Open it to activate your account and sign in.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <Button onClick={resend} variant="secondary" size="lg" fullWidth>
            Send the link again
          </Button>
          <Button onClick={() => setSentTo(null)} variant="ghost" size="lg" fullWidth>
            Use a different email
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already confirmed?{" "}
          <Link href="/login" className="font-medium text-fg hover:text-accent-1">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Start your first challenge in under two minutes.</p>

      <GoogleButton next={HOME_AFTER_LOGIN} label="Sign up with Google" />
      {alert && <Alert>{alert}</Alert>}

      <Divider />

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" htmlFor="su-name" error={errors.name}>
          <Input id="su-name" autoComplete="name" placeholder="Alex Morgan" icon={<User />} value={name} invalid={!!errors.name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} />
        </Field>
        <Field label="Email" htmlFor="su-email" error={errors.email}>
          <Input id="su-email" type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail />} value={email} invalid={!!errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
        </Field>
        <Field label="Password" htmlFor="su-password" error={errors.password}>
          <PasswordInput id="su-password" autoComplete="new-password" value={password} invalid={!!errors.password} onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: undefined })); }} />
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.span
                  className={cn("block h-full rounded-full", BAR[st.score])}
                  initial={false}
                  animate={{ width: st.score >= i ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            ))}
          </div>
          <p className={cn("mt-1.5 text-xs transition-colors", TXT[st.score])} aria-live="polite">
            {st.score ? `Password strength: ${st.label}` : st.label}
          </p>
        </Field>
        <Field label="Country of residence" htmlFor="su-country" error={errors.country}>
          <Select id="su-country" value={country} invalid={!!errors.country} onChange={(e) => { setCountry(e.target.value); setErrors((x) => ({ ...x, country: undefined })); }}>
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {flag(c.code)} {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <Checkbox id="su-terms" checked={terms} invalid={!!errors.terms} onChange={(v) => { setTerms(v); setErrors((x) => ({ ...x, terms: undefined })); }}>
            I agree to the Terms &amp; Conditions and confirm I understand all accounts are simulated.
          </Checkbox>
          {errors.terms && <p role="alert" className="mt-1.5 text-xs text-loss">{errors.terms}</p>}
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading} iconRight={loading ? undefined : <ArrowRight className="size-4" />}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already trading with us?{" "}
        <Link href="/login" className="font-medium text-fg hover:text-accent-1">
          Log in
        </Link>
      </p>
    </div>
  );
}

/* ───────────── Reset password (after the emailed link) ───────────── */

export function ResetPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "code" | "password" | "no-session">("loading");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await getBrowserSupabase().auth.getSession();
      if (!data.session) return setStep("no-session");
      // With 2FA on, Supabase only lets the password change after the code.
      setStep((await needsSecondFactor().catch(() => false)) ? "code" : "password");
    })();
  }, []);

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!CODE_PATTERN.test(code)) return setError("Enter the 6-digit code from your authenticator app.");
    setLoading(true);
    const result = await verifySignInCode(code);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      setCode("");
      return;
    }
    setError(null);
    setStep("password");
  };

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    setLoading(true);
    const { error: updateError } = await getBrowserSupabase().auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.code === "same_password" ? "Choose a password you haven't used here before." : authErrorMessage(updateError));
    toast.success("Password updated", "You're signed in with your new password.");
    await enterDashboard(router, HOME_AFTER_LOGIN);
  };

  if (step === "loading") return <p className="text-sm text-muted">Checking your link…</p>;

  if (step === "no-session") {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Link expired</h1>
        <p className="mt-2 text-sm text-muted">{AUTH_MESSAGES.linkExpired}</p>
        <Button onClick={() => router.push("/login")} size="lg" fullWidth className="mt-7">
          Back to log in
        </Button>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Confirm it’s you</h1>
        <p className="mt-2 text-sm text-muted">Enter the 6-digit code from your authenticator app to set a new password.</p>
        <form onSubmit={submitCode} noValidate className="mt-7 space-y-4">
          <Field label="6-digit code" htmlFor="rp-code" error={error}>
            <Input id="rp-code" inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="123 456" value={code} invalid={!!error} icon={<ShieldCheck />} className="num text-lg tracking-[0.3em]" onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }} />
          </Field>
          <Button type="submit" size="lg" fullWidth loading={loading} disabled={!CODE_PATTERN.test(code)}>
            Continue
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Set a new password</h1>
      <p className="mt-2 text-sm text-muted">Choose a password you don’t use anywhere else.</p>
      <form onSubmit={submitPassword} noValidate className="mt-7 space-y-4">
        <Field label="New password" htmlFor="rp-password" error={error}>
          <PasswordInput id="rp-password" autoComplete="new-password" value={password} invalid={!!error} onChange={(v) => { setPassword(v); setError(null); }} />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading} iconRight={loading ? undefined : <ArrowRight className="size-4" />}>
          {loading ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
