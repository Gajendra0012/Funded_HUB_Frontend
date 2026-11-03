import type { Metadata } from "next";
import { AdminSignInPage } from "@/components/admin/AdminSignInPage";

export const metadata: Metadata = { title: "Admin sign-in" };

export default function Page() {
  return <AdminSignInPage />;
}
