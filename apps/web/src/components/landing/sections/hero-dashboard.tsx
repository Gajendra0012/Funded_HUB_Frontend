"use client";

import { useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { heroAccount as account } from "@/data/landing";
import { cn } from "@/lib/cn";
import { formatSignedUsd, formatSize, formatUsd } from "@/components/landing/lib/format";
import { useInterval } from "@/lib/hooks";
import { LiveDot } from "../ui/basics";
import { NumberRoll } from "../ui/number-roll";
import { TiltCard } from "../ui/tilt-card";
import { CoinsScene, Safe3D } from "../three/lazy";

/*
 * The sample trading account in the hero: equity that ticks, an equity curve,
 * progress to the profit target and the loss limits left. 3D coins float behind it.
 */

// ── Equity curve: a fixed, smooth path from $100,000 up to $104,960 (62% of the 8% target). ──
const W = 520;
const H = 170;
const POINTS = 46;
const END = 104_960;
const Y_MIN = 98_800;
const Y_MAX = 108_900;

const curve = (() => {
  // Gentle upward drift plus fixed wiggles (sine waves), so it looks like a real equity line.
  const raw = Array.from({ length: POINTS }, (_, i) => account.start + i * 95 + Math.sin(i * 0.9) * 380 + Math.sin(i * 2.3) * 210);
  const fix = END - raw[POINTS - 1];
  return raw.map((v, i) => v + (fix * i) / (POINTS - 1));
})();

const x = (i: number) => (i / (POINTS - 1)) * W;
const y = (value: number) => 8 + (1 - (value - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 16);
const LINE = curve.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
const AREA = `${LINE} L${W} ${H} L0 ${H} Z`;
const LAST = { x: x(POINTS - 1), y: y(curve[POINTS - 1]) };

const profitSoFar = END - account.start;
const profitNeeded = account.target - account.start;
const progress = profitSoFar / profitNeeded;

/** Thin progress bar with the brand gradient. */
function Bar({ value, label, thin = false }: { value: number; label: string; thin?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cn("overflow-hidden rounded-full bg-white/[0.07]", thin ? "h-1" : "h-2")}
    >
      <div className="h-full rounded-full bg-gradient-brand shadow-[0_0_12px_-2px_var(--accent-2)]" style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  );
}

function MiniStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-2.5 sm:p-3">
      <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}

export function HeroDashboard() {
  const [equity, setEquity] = useState<number>(account.equity);

  // Every 1.4s move the equity a little, staying inside a narrow band.
  useInterval(() => {
    const move = (Math.random() - 0.46) * 190;
    setEquity((e) => Math.min(105_980, Math.max(104_560, Math.round((e + move) * 100) / 100)));
  }, 1400);

  const today = equity - account.dayStart;
  const dailyLossLeft = Math.min(account.dailyLossLimit, equity - (account.dayStart - account.dailyLossLimit));
  const TodayIcon = today >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    // z-10 keeps the coins and card above the hero background.
    <div className="relative z-10 mx-auto w-full max-w-[580px] lg:mx-0 lg:justify-self-end">
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-2)_22%,transparent),transparent)] blur-2xl" />
      <Safe3D>
        <CoinsScene variant="hero" className="-inset-x-20 -inset-y-24 -z-10 sm:-inset-x-28" />
      </Safe3D>

      <TiltCard>
        <div className="card rounded-[28px] p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <LiveDot />
              <span className="text-[13px] font-semibold">{account.title}</span>
            </div>
            <span className="whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted">
              {account.platform}
              <span className="hidden sm:inline"> · {account.accountId}</span>
            </span>
          </div>

          {/* Equity and today's profit or loss */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Equity</p>
              <NumberRoll value={equity} format="usd" flash className="mt-1 text-[30px] font-semibold leading-none tracking-tight sm:text-[34px]" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Today’s P/L</p>
              <span className={cn("num mt-1 inline-flex items-center gap-0.5 text-sm font-semibold", today >= 0 ? "text-profit" : "text-loss")}>
                <TodayIcon className="size-4" />
                {formatSignedUsd(today)}
              </span>
            </div>
          </div>

          {/* Equity curve */}
          <div className="relative mt-4 rounded-2xl border border-line bg-[#070a12]/60 p-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label="Sample equity curve rising towards the profit target">
              <defs>
                <linearGradient id="hero-stroke" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="var(--accent-1)" />
                  <stop offset="55%" stopColor="var(--accent-2)" />
                  <stop offset="100%" stopColor="var(--accent-3)" />
                </linearGradient>
                <linearGradient id="hero-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.045)" />
              ))}
              <line x1="0" x2={W} y1={y(account.target)} y2={y(account.target)} stroke="var(--accent-1)" strokeOpacity="0.55" strokeDasharray="5 6" />
              <text x={W - 4} y={y(account.target) - 6} textAnchor="end" className="fill-accent-1 font-mono text-[10px]">
                TARGET {formatUsd(account.target, 0)}
              </text>
              <line x1="0" x2={W} y1={y(account.start)} y2={y(account.start)} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 6" />
              <text x={W - 4} y={y(account.start) + 14} textAnchor="end" className="fill-muted font-mono text-[10px]">
                START {formatUsd(account.start, 0)}
              </text>
              <path d={AREA} fill="url(#hero-fill)" className="fade-in-late" />
              <path
                d={LINE}
                pathLength={1}
                fill="none"
                stroke="url(#hero-stroke)"
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="draw-line"
                style={{ filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--accent-2) 60%, transparent))" }}
              />
              <g className="fade-in-late">
                <circle cx={LAST.x} cy={LAST.y} r="4.5" fill="var(--accent-3)" stroke="#05070d" strokeWidth="2" />
              </g>
            </svg>
          </div>

          {/* Progress to the profit target */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-fg/90">Phase 1 · {Math.round(progress * 100)}% to target</span>
              <span className="num text-muted">
                {formatUsd(profitSoFar, 0)} / {formatUsd(profitNeeded, 0)}
              </span>
            </div>
            <Bar value={progress} label="Progress to profit target" />
          </div>

          {/* Limits left */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat label="Daily loss left">
              <NumberRoll value={dailyLossLeft} format="usd0" className="text-[15px] font-semibold" />
              <div className="mt-2">
                <Bar value={dailyLossLeft / account.dailyLossLimit} label="Daily loss limit left" thin />
              </div>
            </MiniStat>
            <MiniStat label="Max loss left">
              <NumberRoll value={equity - account.maxLossFloor} format="usd0" className="text-[15px] font-semibold" />
              <span className="mt-1.5 block text-[10.5px] text-muted">Static · {formatSize(account.maxLossFloor)} floor</span>
            </MiniStat>
            <MiniStat label="Trading days">
              <span className="num text-[15px] font-semibold">
                {account.tradingDays.done} / {account.tradingDays.required}
              </span>
              <span className="mt-2 flex gap-1">
                {Array.from({ length: account.tradingDays.required }, (_, d) => (
                  <span key={d} className={cn("h-1.5 flex-1 rounded-full", d < account.tradingDays.done ? "bg-gradient-brand" : "bg-white/10")} />
                ))}
              </span>
            </MiniStat>
          </div>
        </div>

        {/* Floating chips. translateZ lifts them above the card while it tilts. */}
        <div className="absolute -right-3 -top-6 sm:-right-8 [transform:translateZ(70px)]">
          <div className="float-slow glass-solid flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-2xl">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-1/15 text-accent-1">
              <BadgeCheck className="size-4" />
            </span>
            <div>
              <p className="text-[11px] text-muted">{account.rewardChip.label}</p>
              <p className="num text-sm font-semibold">{formatUsd(account.rewardChip.amount)}</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-3 hidden sm:-left-10 sm:block [transform:translateZ(50px)]">
          <div className="float-slower glass-solid flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-2xl">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-2/15 text-accent-2">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-[11px] text-muted">{account.riskChip.label}</p>
              <p className="text-sm font-semibold">{account.riskChip.value}</p>
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
