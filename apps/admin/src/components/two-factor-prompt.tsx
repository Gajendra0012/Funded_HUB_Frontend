"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CodeInput, Modal } from "@funded-hub/ui";
import { CODE_PATTERN, verifyFreshCode } from "@/lib/auth/fresh-code";

/**
 * Asks for the 6-digit 2FA code when the backend answers MFA_REQUIRED (ADM-09), then the call is
 * sent again. It checks the code like the step before sensitive changes (ADM-19): `verifyFreshCode`.
 * It stays mounted and only switches `open`.
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
    const result = await verifyFreshCode(code);
    if (!result.ok) {
      setError(result.message);
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
