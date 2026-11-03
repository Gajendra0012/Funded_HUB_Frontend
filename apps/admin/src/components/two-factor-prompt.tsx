"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CodeInput, Modal } from "@funded-hub/ui";
import { loginErrorMessage } from "@/lib/auth/login-step";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const CODE_PATTERN = /^\d{6}$/;

/**
 * Asks for the 6-digit 2FA code when the backend answers MFA_REQUIRED (ADM-09), then the call is
 * sent again. The same prompt is the base for "fresh 2FA before sensitive actions" (ADM-19).
 *
 * Keep it mounted and switch `open`: a dialog that mounts already open closes itself in React's
 * development double-run, and the close would count as "cancel".
 */
export function TwoFactorPrompt({ open, onDone }: { open: boolean; onDone: (verified: boolean) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  // The dialog focuses its close button first; put the cursor in the first code box instead.
  useEffect(() => {
    if (open) form.current?.querySelector("input")?.focus();
  }, [open]);

  function finish(verified: boolean) {
    setCode("");
    setError("");
    setBusy(false);
    onDone(verified);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!CODE_PATTERN.test(code)) return;
    setBusy(true);
    setError("");
    const mfa = getBrowserSupabase().auth.mfa;
    const { data: factors, error: listError } = await mfa.listFactors();
    const factor = factors?.totp[0];
    if (listError || !factor) {
      setError(listError ? loginErrorMessage(listError, "credentials") : "No authenticator is set up for this account. Sign out and sign in again to set one up.");
      setBusy(false);
      return;
    }
    const { error: verifyError } = await mfa.challengeAndVerify({ factorId: factor.id, code });
    if (verifyError) {
      setError(loginErrorMessage(verifyError, "code"));
      setCode("");
      setBusy(false);
      return;
    }
    finish(true);
  }

  return (
    <Modal open={open} onClose={() => finish(false)} title="Enter your 2FA code">
      <form ref={form} className="ops-form" onSubmit={submit} data-testid="mfa-prompt">
        <p>To continue, enter the 6-digit code from your authenticator app.</p>
        {error && (
          <p className="inline-alert" role="alert" data-testid="mfa-prompt-error">
            {error}
          </p>
        )}
        <CodeInput value={code} onChange={setCode} label="6-digit code from your app" testId="mfa-prompt-code" />
        <footer>
          <button type="button" onClick={() => finish(false)} disabled={busy} data-testid="mfa-prompt-cancel">
            Cancel
          </button>
          <button type="submit" className="ui-primary" disabled={busy || !CODE_PATTERN.test(code)} data-testid="mfa-prompt-submit">
            {busy ? "Checking…" : "Continue"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
