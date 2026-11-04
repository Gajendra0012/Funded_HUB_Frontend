"use client";

import { useEffect } from "react";
import { identityFromUser } from "@/lib/auth/identity";
import { isTemporaryAuthError } from "@/lib/auth/messages";
import { useDemoStore } from "@/lib/store";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Keeps the dashboard's store in step with the real Supabase session (WEB-10):
 * signed in (also after Google sign-in or in another tab) → the store shows this trader;
 * signed out → the store is cleared. Renders nothing.
 */
export function SessionSync() {
  // Wait until the store has loaded its saved data, so that can't overwrite the real identity.
  const hydrated = useDemoStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const supabase = getBrowserSupabase();
    const apply = (user: Parameters<typeof identityFromUser>[0] | null) => {
      const store = useDemoStore.getState();
      if (!user) {
        if (store.session) store.logout();
        return;
      }
      const identity = identityFromUser(user);
      const current = store.session;
      if (!current || current.email !== identity.email || current.name !== identity.name || current.country !== identity.country) {
        store.login(identity);
      }
    };

    // getUser() asks Supabase, so a session that was ended elsewhere isn't trusted from cookies alone.
    // A network hiccup isn't a sign-out: only a definite answer changes the store.
    void supabase.auth.getUser().then(({ data, error }) => {
      if (error && isTemporaryAuthError(error)) return;
      apply(data.user);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [hydrated]);

  return null;
}
