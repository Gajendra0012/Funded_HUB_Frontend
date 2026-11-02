import type { Metadata } from "next";
import { ChallengeSelector } from "@/components/landing/sections/challenge-selector";
import { Faq } from "@/components/landing/sections/faq";
import { FinalCta } from "@/components/landing/sections/final-cta";
import { GlobalReach } from "@/components/landing/sections/global-reach";
import { Hero } from "@/components/landing/sections/hero";
import { HowItWorks } from "@/components/landing/sections/how-it-works";
import { KeyFacts } from "@/components/landing/sections/key-facts";
import { Leaderboard } from "@/components/landing/sections/leaderboard";
import { PayoutWall } from "@/components/landing/sections/payout-wall";
import { Platform } from "@/components/landing/sections/platform";
import { TraderPromises } from "@/components/landing/sections/trader-promises";

export const metadata: Metadata = {
  title: { absolute: "Funded HUB — Trade up to $200,000 of our capital" },
  description:
    "Crypto prop trading on Bybit Demo. Choose a 2-Step, 1-Step or Instant challenge, trade with simulated capital and earn up to 80% of the profits as real rewards.",
};

/**
 * The home page. Each line below is one section, top to bottom.
 * The navbar, price ticker and footer around it come from ./layout.tsx (shared with /challenges and /leaderboard).
 * Section files:   src/components/landing/sections/
 * Text and numbers: src/data/landing.ts
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <KeyFacts />
      <HowItWorks />
      <ChallengeSelector />
      <GlobalReach />
      <PayoutWall />
      <Platform />
      <Leaderboard />
      <TraderPromises />
      <Faq />
      <FinalCta />
    </>
  );
}
