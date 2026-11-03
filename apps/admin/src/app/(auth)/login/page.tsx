import type { Metadata } from "next";
import { LoginFlow } from "@/components/login-flow";
import { safeNextPath } from "@/lib/auth/access";

export const metadata: Metadata = { title: "Sign in" };

type LoginSearch = Promise<{ next?: string | string[]; reason?: string | string[] }>;

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

/** /login?next=/traders&reason=expired: `next` is where to go after signing in (only pages on this site). */
export default async function LoginPage({ searchParams }: { searchParams: LoginSearch }) {
  const params = await searchParams;
  return <LoginFlow next={safeNextPath(first(params.next))} reason={first(params.reason) ?? null} />;
}
