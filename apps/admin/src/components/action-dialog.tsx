"use client";

import type { ReactNode } from "react";
import { Modal } from "@funded-hub/ui";

/**
 * The frame of every dialog that sends a change (admin users, settings).
 * - It stays mounted and is only opened and closed, so the form stays on screen while the dialog closes.
 * - The form inside gets a new key on each opening, so it starts clean.
 * - It can't be closed while its request runs.
 * Each form asks for a fresh 2FA code before it sends anything (ADM-19, `fresh-code-field.tsx`).
 */
export function ActionDialog({ open, title, busy, onClose, children }: { open: boolean; title: string; busy: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal open={open} title={title} onClose={() => (busy ? undefined : onClose())}>
      {children}
    </Modal>
  );
}

/** A dialog's error message, or nothing. */
export function FormError({ message, testId }: { message: string; testId: string }) {
  if (!message) return null;
  return (
    <p className="inline-alert" role="alert" data-testid={testId}>
      {message}
    </p>
  );
}
