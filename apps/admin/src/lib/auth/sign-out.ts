import { getBrowserSupabase } from "@/lib/supabase/browser";
import { LOGIN_PATH } from "./access";

/** Why the login page is shown again; it explains it to the admin (see loginNotice). */
export type LoginReason = "expired" | "no-access" | "ended";

type Router = { replace: (href: string) => void; refresh: () => void };

/** Ends this browser's session (also in Supabase), then shows the login page with the reason. */
export async function signOutToLogin(router: Router, reason?: LoginReason): Promise<void> {
  await getBrowserSupabase().auth.signOut({ scope: "local" });
  router.replace(reason ? `${LOGIN_PATH}?reason=${reason}` : LOGIN_PATH);
  router.refresh();
}
