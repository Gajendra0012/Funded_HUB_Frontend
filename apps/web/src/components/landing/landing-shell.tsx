"use client";

import { usePathname } from "next/navigation";

// The landing owns its editorial masthead; other routes retain their existing shell.
export function LandingShell({ children }: { children: React.ReactNode }) {
  return usePathname() === "/" ? null : children;
}
