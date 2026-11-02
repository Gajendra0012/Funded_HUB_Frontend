"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Info } from "lucide-react";
import { brand } from "@/config/brand";
import { getPlanPrice, hasPromo } from "@/data/plans";
import {
  accountSizes,
  getProgram,
  leverage,
  popularPlan,
  programNote,
  programs,
  type AccountSize,
  type Program,
  type ProgramId,
} from "@/data/landing";
import { cn } from "@/lib/cn";
import { formatSize, formatUsd } from "@/components/landing/lib/format";
import { BorderBeam } from "../ui/backgrounds";
import { Container, SampleTag, SectionHeading } from "../ui/basics";
import { Button } from "../ui/button";
import { NumberRoll } from "../ui/number-roll";
import { Reveal } from "../ui/reveal";
import { Segmented } from "../ui/segmented";

type Unit = "pct" | "usd";

/** The rule rows in the table. `value` turns a program + size into the text shown on the right. */
const RULES: { label: string; help: string; value: (p: Program, size: AccountSize, unit: Unit) => string; note?: (p: Program) => string }[] = [
  {
    label: "Profit target",
    help: "How much profit you need to pass each phase.",
    value: (p, size, unit) => (p.targets.length ? p.targets.map((t) => show(t, size, unit)).join(" → ") : "None"),
    note: (p) => (p.targets.length === 2 ? "Phase 1 → Phase 2" : p.targets.length === 1 ? "Single phase" : "Funded from day one"),
  },
  {
    label: "Daily loss limit",
    help: "The most you may lose in one trading day. The day resets at 00:00 UTC.",
    value: (p, size, unit) => show(p.dailyLossPct, size, unit),
  },
  {
    label: "Max loss",
    help: "The most the account may ever lose. Static stays fixed; trailing follows your highest balance.",
    value: (p, size, unit) => show(p.maxLossPct, size, unit),
    note: (p) => p.maxLossType,
  },
  {
    label: "Min trading days",
    help: "Days with at least one trade before you can pass a phase.",
    value: (p) => (p.minTradingDays ? `${p.minTradingDays} days / phase` : "None"),
  },
  { label: "Profit share", help: "Your share of the profit when a reward is paid.", value: (p) => `${p.profitSharePct}%` },
  { label: "Reward cycle", help: "How often you can request a reward once funded.", value: (p) => p.rewardCycle },
  { label: "Leverage", help: "The highest leverage allowed per trading pair.", value: () => leverage },
];

/** A rule in % or in dollars for the chosen account size, e.g. 5 → "5%" or "$5,000". */
function show(percent: number, size: AccountSize, unit: Unit) {
  return unit === "pct" ? `${percent}%` : formatUsd((size * percent) / 100, 0);
}

/** Text that blurs out and in whenever it changes. */
function SwapValue({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("relative inline-flex justify-end overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="whitespace-nowrap"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function ChallengeSelector() {
  const [programId, setProgramId] = useState<ProgramId>(popularPlan.program);
  const [size, setSize] = useState<AccountSize>(popularPlan.size);
  const [unit, setUnit] = useState<Unit>("pct");
  const program = getProgram(programId);
  // Prices come from data/plans.ts, the same place the challenges page and checkout use.
  const price = getPlanPrice(programId, size);
  const isPopular = programId === popularPlan.program && size === popularPlan.size;

  const highlights = [
    `${program.profitSharePct}% profit share`,
    program.minTradingDays ? `${program.minTradingDays} min trading days per phase` : "No minimum trading days",
    "Trade on Bybit Demo · BTC, ETH, SOL, BNB",
    `${program.rewardCycle} rewards in USDT, USDC or BTC`,
  ];

  return (
    <section id="challenges" aria-labelledby="challenges-title" className="relative py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-[520px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,color-mix(in_oklab,var(--accent-3)_10%,transparent),transparent)]" />
      <Container>
        <Reveal>
          <SectionHeading
            id="challenges-title"
            eyebrow="Challenges"
            title={
              <>
                Choose your <span className="text-gradient">challenge</span>
              </>
            }
            subtitle="Pick a program and an account size. The rules and price update instantly, so what you see is what you trade."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card mt-12 rounded-[28px] p-4 sm:p-6 lg:p-8">
            {/* Program tabs + % / $ switch */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Segmented
                label="Challenge program"
                style="gradient"
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
                value={programId}
                onChange={setProgramId}
                fullWidth
                className="sm:w-fit"
              />
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <span className="text-xs text-muted">Show rules in</span>
                <Segmented
                  label="Rule units"
                  size="sm"
                  options={[
                    { value: "pct" as Unit, label: "%" },
                    { value: "usd" as Unit, label: "$" },
                  ]}
                  value={unit}
                  onChange={setUnit}
                />
              </div>
            </div>

            <p className="mt-4 min-h-6 text-sm text-muted">
              <span className="font-medium text-fg">{program.title}.</span> {program.description}
            </p>

            {/* Account sizes */}
            <div role="radiogroup" aria-label="Account size" className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {accountSizes.map((s) => {
                const active = s === size;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSize(s)}
                    className={cn(
                      "relative isolate flex h-14 flex-col items-center justify-center rounded-xl border px-2 transition-colors duration-200",
                      active ? "border-transparent text-fg" : "border-line bg-white/[0.02] text-muted hover:border-white/15 hover:text-fg",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="size-highlight"
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-xl border border-accent-2/50 bg-accent-2/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_-8px_var(--accent-2)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="num text-[15px] font-semibold">{formatSize(s)}</span>
                    {s === popularPlan.size && <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-accent-1">Popular</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
              {/* Rules table */}
              <div className="overflow-hidden rounded-2xl border border-line bg-[#070a12]/50">
                <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                  <p className="text-sm font-semibold">Trading rules</p>
                  <SampleTag>Example values</SampleTag>
                </div>
                <dl className="divide-y divide-line">
                  {RULES.map((rule) => (
                    <div key={rule.label} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.02] sm:px-5">
                      <dt className="flex items-center gap-1.5 text-sm text-muted">
                        {rule.label}
                        <span title={rule.help} className="text-muted/70">
                          <Info className="size-3.5" aria-hidden />
                          <span className="sr-only">{rule.help}</span>
                        </span>
                      </dt>
                      <dd className="flex flex-col items-end text-right">
                        <SwapValue value={rule.value(program, size, unit)} className="num text-[15px] font-semibold text-fg" />
                        {rule.note && <SwapValue value={rule.note(program)} className="text-[11px] text-muted" />}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Price card */}
              <div
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5 transition-colors duration-500 sm:p-6",
                  isPopular ? "border-transparent bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-2)_10%,transparent),transparent_55%)]" : "border-line bg-white/[0.02]",
                )}
              >
                {isPopular && <BorderBeam seconds={5} />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">{program.title}</p>
                    <p className="num mt-1 text-2xl font-semibold">{formatUsd(size, 0)} account</p>
                  </div>
                  {isPopular && (
                    <span className="whitespace-nowrap rounded-full bg-gradient-brand px-2.5 py-1 text-[11px] font-semibold text-ink shadow-[0_0_20px_-4px_var(--accent-1)]">
                      Most popular
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-xs text-muted">One-time fee</p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <NumberRoll value={price.price} format="usd0" className="text-[46px] font-semibold leading-none tracking-tight" />
                    {price.compareAt !== null && (
                      <span className="num text-lg text-muted line-through decoration-loss/70">{formatUsd(price.compareAt, 0)}</span>
                    )}
                  </div>
                  <div className="mt-3 flex min-h-6 flex-wrap items-center gap-2">
                    {hasPromo(programId) && (
                      <span className="rounded-full border border-accent-1/30 bg-accent-1/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-1">
                        −{brand.promo.pct}% {brand.promo.label}
                      </span>
                    )}
                    <span className="text-xs text-muted">{program.feeRefunded ? "Refunded with your first reward" : "Fee not refundable"}</span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {highlights.map((text) => (
                    <li key={text} className="flex items-start gap-2.5 text-fg/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-1" />
                      {text}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button href={`/checkout?model=${programId}&size=${size}`} size="lg" className="w-full" iconRight={<ArrowRight className="size-4" />}>
                    Start challenge
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted">{programNote}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
