"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

export function DashboardRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname === "/dashboard" ? children : <DashboardShell>{children}</DashboardShell>;
}
