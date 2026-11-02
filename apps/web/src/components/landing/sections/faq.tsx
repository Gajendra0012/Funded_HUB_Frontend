import { Headphones } from "lucide-react";
import { faq } from "@/data/landing";
import { Accordion } from "../ui/accordion";
import { Container, SectionHeading } from "../ui/basics";
import { Reveal } from "../ui/reveal";

/** Frequently asked questions, with a support note on the left. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative py-20 sm:py-24">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            id="faq-title"
            align="left"
            eyebrow="FAQ"
            title="Questions, answered"
            subtitle="What traders ask before their first challenge."
          />
          <div className="card mt-8 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-2/12 text-accent-2">
                <Headphones className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Trader support</p>
                <p className="text-xs text-muted">Email and live chat open at launch.</p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="card rounded-3xl px-5 sm:px-7">
            <Accordion items={faq} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
