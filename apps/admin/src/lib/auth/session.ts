import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { displayName, initialsOf, sessionExpiresAt, sessionState, type SessionClaims } from "./claims";
import { LOGIN_PATH } from "./access";

/** What the admin pages know about the signed-in admin. */
export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  initials: string;
  /** When the 12-hour session ends, in milliseconds since 1970. */
  expiresAtMs: number;
};

/**
 * The server-side session check (ADM-16), the second layer after src/proxy.ts.
 * Verifies the token's signature and checks: password + 2FA code, signed in less than 12 hours ago.
 * Anyone else is sent to /login. `cache` runs it once per request, however many places call it.
 */
export const verifyAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = (data?.claims ?? null) as SessionClaims | null;
  const nowSeconds = Math.floor(Date.now() / 1000);

  const state = sessionState(claims, nowSeconds);
  // /login clears a non-admin session (src/proxy.ts) and says why.
  if (state === "not-admin") redirect(`${LOGIN_PATH}?reason=no-access`);
  if (!claims || state !== "active") redirect(LOGIN_PATH);

  const name = displayName(claims);
  return {
    userId: claims.sub,
    email: claims.email ?? "",
    name,
    initials: initialsOf(name),
    expiresAtMs: (sessionExpiresAt(claims) ?? nowSeconds) * 1000,
  };
});
