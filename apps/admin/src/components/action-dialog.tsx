"use client";

import type { ReactNode } from "react";
import { Modal } from "@funded-hub/ui";

/**
 * The frame of every dialog that sends a change (admin users, settings).
 * - It stays mounted and is only opened and closed: the shared Modal closes itself when it mounts
 *   already open in React's development double-run (ADM-03).
 * - The form inside gets a new key on each opening, so it starts clean, and stays on screen while
 *   the dialog closes.
 * - It can't be closed while its request runs.
 * AO-7 adds the fresh 2FA code (ADM-19) to the forms inside these dialogs.
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
