"use client";

import { LiveDot } from "../ui/basics";
import { CandlesScene, Safe3D, WhenNearScreen } from "../three/lazy";

/** Card holding the 3D candlestick chart (loaded only when the section comes near the screen). */
export function CandlesSceneCard() {
  return (
    <div className="card relative h-full min-h-[340px] overflow-hidden rounded-3xl sm:min-h-[420px]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_70%,color-mix(in_oklab,var(--accent-2)_14%,transparent),transparent)]" />
      <WhenNearScreen className="absolute inset-0">
        <Safe3D>
          <CandlesScene />
        </Safe3D>
      </WhenNearScreen>
      <div className="relative flex items-center justify-between p-5">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <LiveDot /> BTCUSDT · Perpetual
        </span>
        <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted">Bybit Demo</span>
      </div>
    </div>
  );
}
