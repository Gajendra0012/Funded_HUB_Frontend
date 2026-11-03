"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLogin } from "./AdminLogin";
import { checkAdminEnv, readAdminEnv } from "@/lib/admin/env";

export const ADMIN_LOGIN_PATH = "/admin/login";

export function AdminSignInPage() {
  const router = useRouter();
  const { env } = checkAdminEnv(readAdminEnv());

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-lg content-center gap-4 px-4 py-12">
      <Link href="/" className="justify-self-start text-sm text-muted hover:text-fg">← Back to website</Link>
      {env ? <AdminLogin onAuthenticated={() => router.replace("/dashboard")} />
        : <p role="alert" className="card rounded-2xl p-6">Admin sign-in is unavailable. Check the frontend connection settings.</p>}
    </main>
  );
}
