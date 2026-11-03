import type { Metadata } from "next";
import { DashboardRouteShell } from "@/components/dashboard/DashboardRouteShell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard · Funded HUB" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardRouteShell>{children}</DashboardRouteShell>;
}
