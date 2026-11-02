"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { samplePaidLast24h, samplePayouts } from "@/data/landing";
import { formatUsd } from "@/components/landing/lib/format";
import { useInterval } from "@/lib/hooks";
import { Avatar, Container, LiveDot, SampleTag, SectionHeading } from "../ui/basics";
import { Marquee } from "../ui/marquee";
import { NumberRoll } from "../ui/number-roll";
import { Reveal } from "../ui/reveal";

type Payout = (typeof samplePayouts)[number];

function PayoutCard({ payout }: { payout: Payout }) {
  return (
    <div className="w-[260px] shrink-0 rounded-2xl border border-line bg-[linear-gradient(180deg,#0e1420,#0a0e17)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-3">
        <Avatar name={payout.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{payout.name}</p>
          <p className="text-[11px] text-muted">
            {payout.size} account · {payout.ago}
          </p>
        </div>
        <BadgeCheck className="size-4 shrink-0 text-accent-1" aria-hidden />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-muted">Reward paid</p>
          <p className="num text-xl font-semibold tracking-tight">{formatUsd(payout.amount)}</p>
        </div>
        <span className="rounded-md border border-line bg-white/[0.04] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-fg/85">{payout.method}</span>
      </div>
    </div>
  );
}

/** Two rows of SAMPLE payout cards scrolling in opposite directions, and a running total. */
export function PayoutWall() {
  const [paid, setPaid] = useState(samplePaidLast24h);
  useInterval(() => setPaid((value) => value + Math.round(900 + Math.random() * 5200)), 4200);

  const half = Math.ceil(samplePayouts.length / 2);

  return (
    <section id="payouts" aria-labelledby="payouts-title" className="relative py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              id="payouts-title"
              align="left"
              eyebrow="Payouts"
              title={
                <>
                  Real rewards. <span className="text-gradient">Paid in crypto.</span>
                </>
              }
              subtitle="Funded traders request rewards in USDT, USDC or BTC. Every request is reviewed, then paid. Names are masked for privacy."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card flex items-center gap-4 rounded-2xl px-5 py-4">
              <LiveDot />
              <div>
                <p className="text-xs text-muted">Paid in the last 24h</p>
                <NumberRoll value={paid} format="usd0" flash className="text-2xl font-semibold" />
              </div>
              <SampleTag>Sample</SampleTag>
            </div>
          </Reveal>
        </div>
      </Container>

      <div className="mt-12 space-y-4">
        <Marquee duration={70} label="Sample payouts, first row">
          {samplePayouts.slice(0, half).map((payout) => (
            <PayoutCard key={payout.name} payout={payout} />
          ))}
        </Marquee>
        <Marquee duration={80} reverse label="Sample payouts, second row">
          {samplePayouts.slice(half).map((payout) => (
            <PayoutCard key={payout.name} payout={payout} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
