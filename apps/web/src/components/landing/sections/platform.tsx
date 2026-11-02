import { Activity, Gauge, Layers, UserRound, type LucideIcon } from "lucide-react";
import { platformFeatures, type PlatformIcon } from "@/data/landing";
import { Container, SectionHeading } from "../ui/basics";
import { Reveal } from "../ui/reveal";
import { CandlesSceneCard } from "./platform-chart";

const ICONS: Record<PlatformIcon, LucideIcon> = {
  prices: Activity,
  account: UserRound,
  pairs: Layers,
  leverage: Gauge,
};

/** "Trade on Bybit Demo": a 3D candlestick chart beside four feature cards. */
export function Platform() {
  return (
    <section id="platform" aria-labelledby="platform-title" className="relative py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            id="platform-title"
            eyebrow="Platform"
            title={
              <>
                Trade on <span className="text-gradient">Bybit Demo</span>
              </>
            }
            subtitle="No new terminal to learn. You trade on Bybit's demo environment with real market prices, and Funded HUB tracks your rules and progress."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <CandlesSceneCard />
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {platformFeatures.map((feature, i) => {
              const Icon = ICONS[feature.icon];
              return (
                <Reveal key={feature.title} delay={0.05 * i}>
                  <div className="card card-hover h-full rounded-2xl p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-accent-2/12 text-accent-2">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{feature.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
