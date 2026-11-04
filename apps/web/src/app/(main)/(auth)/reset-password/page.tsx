import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Set a new password" };

/** Opened from the password-reset email, after /auth/callback signed the trader in (WEB-10). */
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
