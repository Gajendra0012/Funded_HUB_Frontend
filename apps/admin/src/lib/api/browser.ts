import { assertAdminEnv } from "@/config/env";
import { isTemporaryAuthError } from "@/lib/auth/login-step";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { createAdminApi, type AdminApi, type AdminApiConfig, type TokenResult } from "./client";

/**
 * The API helper for the browser (ADM-09): tokens come from this tab's Supabase session, which renews
 * itself before it expires. A failed renewal because Supabase can't be reached is "unavailable" (try
 * again later), never a reason to sign the admin out.
 */
export function createBrowserAdminApi(handlers: Pick<AdminApiConfig, "onSessionEnded" | "onMfaRequired">): AdminApi {
  // Supabase is only touched when a call is made, never while a page renders (also on the server).
  const auth = () => getBrowserSupabase().auth;
  const toTokenResult = (session: { access_token: string } | null, error: { status?: number; name?: string } | null): TokenResult => {
    if (session) return { token: session.access_token };
    return { error: isTemporaryAuthError(error) ? "unavailable" : "ended" };
  };

  return createAdminApi({
    baseUrl: assertAdminEnv().adminApiUrl,
    async getAccessToken() {
      const { data, error } = await auth().getSession();
      return toTokenResult(data.session, error);
    },
    async refreshAccessToken() {
      const { data, error } = await auth().refreshSession();
      return toTokenResult(data.session, error);
    },
    ...handlers,
  });
}
