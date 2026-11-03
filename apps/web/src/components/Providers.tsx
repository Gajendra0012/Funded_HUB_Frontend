"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { DemoControls } from "@/components/DemoControls";
import { Toaster } from "@/components/ui/Toaster";
import { ConnectWalletModal } from "@/components/wallet/ConnectWalletModal";
import { hydrateDemoStore } from "@/lib/store";
import { initWallets } from "@/lib/wallet";

export function Providers({ children }: { children: ReactNode }) {
  const adminSignIn = usePathname() === "/admin/login";
  useEffect(() => {
    void hydrateDemoStore();
    initWallets();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
      {!adminSignIn && <ConnectWalletModal />}
      <Toaster />
      {!adminSignIn && <DemoControls />}
    </MotionConfig>
  );
}
