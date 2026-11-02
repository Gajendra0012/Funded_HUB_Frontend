import Link from "next/link";
import { ArrowRight, ArrowUpRight, Crown } from "lucide-react";
import { sampleLeaderboard } from "@/data/landing";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/components/landing/lib/format";
import { Avatar, Container, SectionHeading } from "../ui/basics";
import { Reveal } from "../ui/reveal";

const CROWN_COLORS = ["text-warning", "text-[#c8d3e6]", "text-[#e0a574]"]; // gold, silver, bronze

/** SAMPLE top-5 table, linking to the full leaderboard page. */
export function Leaderboard() {
  return (
    <section aria-labelledby="leaderboard-title" className="relative py-20 sm:py-24">
      <Container className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal>
          <SectionHeading
            id="leaderboard-title"
            align="left"
            eyebrow="Leaderboard"
            title={
              <>
                This month’s <span className="text-gradient">top performers</span>
              </>
            }
            subtitle="Ranked by return on funded and evaluation accounts, updated every trading day."
          />
          <Link href="/leaderboard" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-1">
            View full leaderboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-sm">
                <caption className="sr-only">Sample leaderboard: top five traders this month</caption>
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th scope="col" className="px-5 py-3.5 font-medium">
                      #
                    </th>
                    <th scope="col" className="px-2 py-3.5 font-medium">
                      Trader
                    </th>
                    <th scope="col" className="px-2 py-3.5 font-medium">
                      Account
                    </th>
                    <th scope="col" className="px-2 py-3.5 text-right font-medium">
                      Profit
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">
                      Gain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sampleLeaderboard.map((trader, i) => (
                    <tr key={trader.name} className="border-b border-line/70 transition-colors last:border-0 hover:bg-white/[0.025]">
                      <td className="px-5 py-3.5">
                        {i < 3 ? <Crown className={cn("size-4", CROWN_COLORS[i])} aria-label={`Rank ${i + 1}`} /> : <span className="num text-muted">{i + 1}</span>}
                      </td>
                      <td className="px-2 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={trader.name} />
                          <span className="font-medium">{trader.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3.5">
                        <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-xs text-fg/85">{trader.account}</span>
                      </td>
                      <td className="px-2 py-3.5 text-right">
                        <span className="num inline-flex items-center gap-0.5 font-semibold text-profit">
                          <ArrowUpRight className="size-3.5" />+{trader.profitPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="num px-5 py-3.5 text-right text-fg/90">+{formatUsd(trader.gain, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
