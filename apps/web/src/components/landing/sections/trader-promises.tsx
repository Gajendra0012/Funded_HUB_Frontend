import { BadgeCheck, Clock3, Coins, Eye, LineChart, UserRound, type LucideIcon } from "lucide-react";
import { traderPromises, type PromiseIcon } from "@/data/landing";
import { Container, SectionHeading } from "../ui/basics";
import { Marquee } from "../ui/marquee";
import { Reveal } from "../ui/reveal";

const ICONS: Record<PromiseIcon, LucideIcon> = {
  rules: Eye,
  account: UserRound,
  prices: LineChart,
  reset: Clock3,
  review: BadgeCheck,
  crypto: Coins,
};

/** Scrolling cards with what every trader gets (in the style of the sample's review cards). */
export function TraderPromises() {
  return (
    <section aria-labelledby="promises-title" className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            id="promises-title"
            eyebrow="Built for traders"
            title={
              <>
                Built around <span className="text-gradient">how traders work</span>
              </>
            }
            subtitle="Clear rules, your own exchange account and rewards you can see coming."
          />
        </Reveal>
      </Container>
      <div className="mt-12">
        <Marquee duration={65} label="What every Funded HUB trader gets">
          {traderPromises.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.title} className="flex w-[300px] shrink-0 flex-col rounded-3xl border border-line bg-[linear-gradient(180deg,#0e1420,#0a0e17)] p-6 sm:w-[340px]">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-brand text-ink shadow-[0_0_24px_-6px_var(--accent-2)]">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
              </div>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}
