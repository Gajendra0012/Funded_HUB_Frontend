"use client";

import { ArrowRight } from "lucide-react";
import { BorderBeam, GridBeams } from "../ui/backgrounds";
import { Container } from "../ui/basics";
import { Button } from "../ui/button";
import { Reveal } from "../ui/reveal";
import { CoinsScene, Safe3D, WhenNearScreen } from "../three/lazy";

/** Big closing card with 3D coins on both sides. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[32px] border border-transparent p-8 text-center sm:p-14 lg:p-20">
            <BorderBeam seconds={7} />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[#070b14]" />
            <div aria-hidden className="aurora -z-10 opacity-80">
              <span className="a1" />
              <span className="a2" />
            </div>
            <GridBeams className="-z-10 opacity-70" beams={false} />
            {/* 3D coins: only on wider screens, where there is room beside the text. */}
            <WhenNearScreen className="absolute inset-0 -z-10 hidden md:block">
              <Safe3D>
                <CoinsScene variant="cta" />
              </Safe3D>
            </WhenNearScreen>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-1">Your capital is waiting</p>
            <h2 id="cta-title" className="mx-auto mt-5 max-w-3xl text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Prove your edge. <span className="text-gradient">Trade up to $200K.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
              Pick a program, connect Bybit Demo and trade under clear rules for up to 80% of the profits.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/challenges" size="lg" iconRight={<ArrowRight className="size-4" />}>
                Start challenge
              </Button>
              <Button href="/checkout?model=two-step&size=100000" variant="secondary" size="lg">
                Get the $100K 2-Step
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
