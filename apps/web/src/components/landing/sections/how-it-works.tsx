"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { BadgeDollarSign, Crosshair, Link2, Target, type LucideIcon } from "lucide-react";
import { steps, type StepIcon } from "@/data/landing";
import { cn } from "@/lib/cn";
import { Container, SectionHeading } from "../ui/basics";
import { Reveal } from "../ui/reveal";

const ICONS: Record<StepIcon, LucideIcon> = {
  choose: Crosshair,
  connect: Link2,
  target: Target,
  payout: BadgeDollarSign,
};

/**
 * Four steps on a vertical line. As you scroll, the line fills with the brand
 * gradient and each step lights up when the line reaches it.
 */
export function HowItWorks() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 72%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [activeStep, setActiveStep] = useState(-1);

  // Light up every step the line has passed.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const reached = steps.findLastIndex((_, i) => progress >= (i / (steps.length - 1)) * 0.92 + 0.02);
    setActiveStep(reached);
  });

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            id="how-title"
            eyebrow="How it works"
            title={
              <>
                From challenge to payout in <span className="text-gradient">four steps</span>
              </>
            }
            subtitle="A clear path with rules you can see on every screen. No hidden conditions."
          />
        </Reveal>

        <div ref={listRef} className="relative mx-auto mt-16 max-w-4xl">
          {/* The line, and its gradient fill that follows the scroll. */}
          <div aria-hidden className="absolute bottom-6 left-[23px] top-6 w-px bg-white/[0.08] md:left-1/2 md:-translate-x-1/2">
            <motion.div
              style={{ scaleY: fill }}
              className="h-full w-full origin-top bg-[linear-gradient(to_bottom,var(--accent-1),var(--accent-2),var(--accent-3))] shadow-[0_0_14px_var(--accent-2)]"
            />
          </div>

          <ol className="relative space-y-8 md:space-y-0 md:[&>li+li]:-mt-10">
            {steps.map((step, i) => {
              const Icon = ICONS[step.icon];
              const lit = i <= activeStep;
              const onRight = i % 2 === 1;
              return (
                <li key={step.title} className="relative grid grid-cols-[48px_1fr] items-start gap-5 md:grid-cols-2 md:gap-16">
                  {/* Round icon on the line */}
                  <div className="relative z-10 md:absolute md:left-1/2 md:top-6 md:-translate-x-1/2">
                    <div
                      className={cn(
                        "grid size-12 place-items-center rounded-2xl border transition-all duration-500 ease-expo",
                        lit ? "scale-110 border-transparent bg-gradient-brand text-ink shadow-[0_0_32px_-4px_var(--accent-2)]" : "border-line-strong bg-[#0b101a] text-muted",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                  </div>
                  {/* Card, alternating left and right on wide screens */}
                  <div className={onRight ? "md:col-start-2" : "md:col-start-1 md:text-right"}>
                    <div className={cn("card rounded-2xl p-5 transition-all duration-500 ease-expo sm:p-6", lit ? "border-white/15 opacity-100" : "translate-y-3 opacity-55")}>
                      <p className="num text-xs text-accent-1">0{i + 1}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                      <span
                        className={cn(
                          "mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs",
                          lit ? "border-accent-1/30 bg-accent-1/10 text-accent-1" : "border-line text-muted",
                        )}
                      >
                        {step.chip}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
