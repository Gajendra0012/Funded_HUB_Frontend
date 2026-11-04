import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useDemoStore } from "@/lib/store";
import { LOGIN_PATH } from "./redirects";

type Router = { replace: (href: string) => void; refresh: () => void };

/** Ends this browser's Supabase session and clears the dashboard's copy, then shows the login page. */
export async function signOutToLogin(router: Router): Promise<void> {
  await getBrowserSupabase().auth.signOut({ scope: "local" });
  useDemoStore.getState().logout();
  router.replace(LOGIN_PATH);
  router.refresh();
}
