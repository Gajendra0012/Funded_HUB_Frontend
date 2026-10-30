"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { applyPreviewCommand, initialState, type PreviewCommand, type PreviewState } from "@/lib/preview";

const PreviewContext = createContext<{ state: PreviewState; execute: (command: PreviewCommand) => PreviewState; reset: () => void } | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [resetVersion, setResetVersion] = useState(0);
  function execute(command: PreviewCommand) {
    const next = applyPreviewCommand(state, command, { id: crypto.randomUUID(), at: new Date().toISOString() });
    setState(next);
    return next;
  }
  return <PreviewContext.Provider key={resetVersion} value={{ state, execute, reset: () => { setState(initialState); setResetVersion(value => value + 1); } }}>{children}</PreviewContext.Provider>;
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error("Admin preview requires PreviewProvider.");
  return context;
}
