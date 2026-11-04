"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SessionSync } from "@/components/auth/SessionSync";
import { DemoControls } from "@/components/DemoControls";
import { Toaster } from "@/components/ui/Toaster";
import { ConnectWalletModal } from "@/components/wallet/ConnectWalletModal";
import { hydrateDemoStore } from "@/lib/store";
import { initWallets } from "@/lib/wallet";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateDemoStore();
    initWallets();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SessionSync />
      {children}
      <ConnectWalletModal />
      <Toaster />
      <DemoControls />
    </MotionConfig>
  );
}
