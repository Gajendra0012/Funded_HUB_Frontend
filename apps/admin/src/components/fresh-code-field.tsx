"use client";

import { useState } from "react";
import { CodeInput } from "@funded-hub/ui";
import { CODE_PATTERN, verifyFreshCode } from "@/lib/auth/fresh-code";

export type FreshCode = {
  code: string;
  setCode: (code: string) => void;
  /** All 6 digits typed. */
  complete: boolean;
  /** Checks the code with Supabase; null when it's right, otherwise the message to show (the boxes are cleared). */
  confirm: () => Promise<string | null>;
};

/**
 * The fresh 2FA code a sensitive change asks for (ADM-19): adding an admin, changing roles, disabling or
 * re-enabling an admin, saving a setting. Each change asks again, with empty boxes. Supabase accepts a
 * code for as long as it's valid (this window and the one before, about 60–90 seconds), even if it was
 * just used: checked locally on 3 Nov, see gap G4.
 */
export function useFreshCode(): FreshCode {
  const [code, setCode] = useState("");
  return {
    code,
    setCode,
    complete: CODE_PATTERN.test(code),
    async confirm() {
      const result = await verifyFreshCode(code);
      if (result.ok) return null;
      setCode("");
      return result.message;
    },
  };
}

export function FreshCodeField({ fresh, testId }: { fresh: FreshCode; testId: string }) {
  return (
    <div className="fresh-code">
      <p className="fresh-code-label">To confirm, enter the 6-digit code from your authenticator app.</p>
      <CodeInput value={fresh.code} onChange={fresh.setCode} label="6-digit code from your app" testId={testId} />
    </div>
  );
}
