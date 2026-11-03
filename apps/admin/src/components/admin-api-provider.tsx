"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createBrowserAdminApi } from "@/lib/api/browser";
import type { AdminApi } from "@/lib/api/client";
import { signOutToLogin } from "@/lib/auth/sign-out";
import { TwoFactorPrompt } from "./two-factor-prompt";

const AdminApiContext = createContext<AdminApi | null>(null);

/**
 * Gives the admin pages the API helper (ADM-09), wired to this browser's session:
 *  - the session can't be renewed any more: sign out and show the login page
 *  - the backend asks for 2FA (MFA_REQUIRED): one code prompt, shared by every call waiting for it
 */
export function AdminApiProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<{ resolve: (verified: boolean) => void } | null>(null);

  const [api] = useState(() => {
    let signingOut = false;
    let pendingPrompt: Promise<boolean> | null = null;
    return createBrowserAdminApi({
      onSessionEnded() {
        if (signingOut) return;
        signingOut = true;
        void signOutToLogin(router, "ended");
      },
      onMfaRequired() {
        pendingPrompt ??= new Promise<boolean>((resolve) => setPrompt({ resolve })).finally(() => {
          pendingPrompt = null;
        });
        return pendingPrompt;
      },
    });
  });

  return (
    <AdminApiContext value={api}>
      {children}
      <TwoFactorPrompt
        open={prompt !== null}
        onDone={(verified) => {
          // A dialog also reports "closed" after it was answered; only the first answer counts.
          prompt?.resolve(verified);
          setPrompt(null);
        }}
      />
    </AdminApiContext>
  );
}

/** The API helper for admin pages. Every backend call goes through it. */
export function useAdminApi(): AdminApi {
  const api = useContext(AdminApiContext);
  if (!api) throw new Error("useAdminApi must be used inside <AdminApiProvider>.");
  return api;
}
