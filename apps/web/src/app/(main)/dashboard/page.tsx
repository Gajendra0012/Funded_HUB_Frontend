import type { Metadata } from "next";
import { LiveAdminDashboard } from "@/components/admin/LiveAdminDashboard";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function DashboardPage() {
  return <LiveAdminDashboard />;
}
