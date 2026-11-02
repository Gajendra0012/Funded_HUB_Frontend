"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, MapPin } from "lucide-react";
import { brand } from "@/config/brand";
import { globeCities, headquarters, payoutMethods, reachPoints } from "@/data/landing";
import { formatUsd } from "@/components/landing/lib/format";
import { useInterval } from "@/lib/hooks";
import { Container, LiveDot, SampleTag, SectionHeading } from "../ui/basics";
import { Reveal } from "../ui/reveal";
import { Globe, Safe3D, WhenNearScreen } from "../three/lazy";

type FeedItem = { id: number; city: string; amount: number; method: string; location: [number, number] };

// The globe markers: every city, plus a bigger one for the headquarters.
const MARKERS = [
  { location: headquarters.location, size: 0.05 },
  ...globeCities.map((c, i) => ({ location: c.location, size: 0.02 + (i % 4) * 0.006 })),
];

// Fixed first items (same on server and browser). New ones are added at random every 2.8s.
const FIRST_FEED: FeedItem[] = [
  { id: 3, city: "Istanbul", amount: 4210, method: "USDT", location: globeCities[3].location },
  { id: 2, city: "Lagos", amount: 2865.5, method: "USDC", location: globeCities[1].location },
  { id: 1, city: "Mumbai", amount: 6120.25, method: "USDT", location: globeCities[0].location },
];

/** Globe with reward arcs from Dubai, and a SAMPLE feed of rewards being paid. */
export function GlobalReach() {
  const [feed, setFeed] = useState(FIRST_FEED);

  useInterval(() => {
    const city = globeCities[Math.floor(Math.random() * globeCities.length)];
    const amount = Math.round((900 + Math.random() * 11_500) * 100) / 100;
    const method = payoutMethods[Math.floor(Math.random() * payoutMethods.length)];
    setFeed((items) => [{ id: items[0].id + 1, city: city.city, amount, method, location: city.location }, ...items].slice(0, 4));
  }, 2800);

  // Arcs from the headquarters to the three newest rewards.
  const arcs = feed.slice(0, 3).map((item) => ({ from: headquarters.location, to: item.location }));

  return (
    <section aria-labelledby="reach-title" className="relative overflow-hidden py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,color-mix(in_oklab,var(--accent-2)_8%,transparent),transparent)]" />
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading
              id="reach-title"
              align="left"
              eyebrow="Global reach"
              title={
                <>
                  Trade from <span className="text-gradient">wherever Bybit serves</span>
                </>
              }
              subtitle={`${brand.name} is based in ${headquarters.city} and open to traders in every country where Bybit offers its service. Sign-up checks eligibility first.`}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {reachPoints.map((point) => (
                <li key={point} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-sm text-fg/90">
                  <MapPin className="size-3.5 text-accent-1" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <LiveDot /> Reward feed
              </p>
              <SampleTag>Simulated</SampleTag>
            </div>
            <ul className="relative space-y-2">
              <AnimatePresence initial={false} mode="popLayout">
                {feed.map((item, i) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -24, scale: 0.97 }}
                    animate={{ opacity: i === 3 ? 0.35 : 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-[#0a0f19]/80 px-3.5 py-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-1/10 text-accent-1">
                      <BadgeCheck className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="num font-semibold text-fg">{formatUsd(item.amount)}</span>
                        <span className="text-muted"> reward sent to </span>
                        <span className="text-fg/90">{item.city}</span>
                      </p>
                      <p className="text-xs text-muted">
                        {i === 0 ? "just now" : `${i * 3 + 1}s ago`} · {item.method}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>

        <Reveal delay={0.05} className="relative mx-auto w-full max-w-[560px]">
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-2)_20%,transparent),transparent)] blur-2xl" />
          <WhenNearScreen className="aspect-square w-full">
            <Safe3D>
              <Globe markers={MARKERS} arcs={arcs} label={`Globe showing reward arcs from ${headquarters.city} to traders around the world`} />
            </Safe3D>
          </WhenNearScreen>
          <div className="glass-solid absolute bottom-[6%] left-0 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl sm:left-[4%]">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-2/15 text-accent-2">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="text-[11px] text-muted">Headquarters</p>
              <p className="text-sm font-semibold">
                {headquarters.city}, {headquarters.country}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
