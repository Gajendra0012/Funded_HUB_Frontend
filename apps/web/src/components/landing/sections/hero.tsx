import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { hero } from "@/data/landing";
import { AuroraBackground } from "../ui/backgrounds";
import { HeroCtas } from "@/components/marketing/HeroClient";
import { Container } from "../ui/basics";
import { ScrambleText } from "../ui/scramble-text";
import { HeroDashboard } from "./hero-dashboard";

/** `--i` sets the order in which each word blurs in (see .word-in in theme.css). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** First screen: headline and buttons on the left, the live account card with 3D coins on the right. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <AuroraBackground />
      <Container className="relative grid grid-cols-1 items-center gap-16 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div className="relative z-10 max-w-2xl">
          <span className="word-in inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-muted backdrop-blur" style={order(0)}>
            <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[11px] font-semibold text-ink">{hero.badge.tag}</span>
            {hero.badge.text}
          </span>

          <h1 id="hero-title" className="mt-6 text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[64px] lg:text-[76px]">
            <span className="word-in" style={order(1)}>Trade</span> <span className="word-in" style={order(2)}>up</span>{" "}
            <span className="word-in" style={order(3)}>to</span>{" "}
            <span className="word-in" style={order(4)}>
              <span className="text-gradient-animated">$200,000</span>
            </span>{" "}
            <span className="word-in" style={order(5)}>of</span> <span className="word-in" style={order(6)}>our</span>{" "}
            <span className="word-in" style={order(7)}>capital.</span>
          </h1>

          <p className="word-in mt-5 font-mono text-[19px] sm:text-2xl" style={order(9)}>
            <span className="text-muted">Your edge in </span>
            <ScrambleText words={hero.keywords} className="font-semibold text-gradient" />
            <span className="caret" aria-hidden />
          </p>

          <p className="word-in mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style={order(10)}>
            {hero.text}
          </p>

          {/* Same buttons as the sample: "Start Challenge" and "View Live Dashboard Demo" (signs in a demo account). */}
          <HeroCtas />

          <ul className="word-in mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted" style={order(13)}>
            {hero.trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check className="size-4 text-accent-1" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <HeroDashboard />
      </Container>
    </section>
  );
}
