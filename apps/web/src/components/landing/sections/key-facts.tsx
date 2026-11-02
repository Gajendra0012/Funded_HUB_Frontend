import { keyFacts } from "@/data/landing";
import { Container } from "../ui/basics";
import { Reveal } from "../ui/reveal";

/** Four key facts under the hero, in one rounded strip. */
export function KeyFacts() {
  return (
    <section aria-label="Key facts" className="relative py-6 sm:py-10">
      <Container>
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="group relative flex flex-col bg-[#080c15] px-5 py-7 sm:px-8 sm:py-9">
                <dt className="text-[13px] font-medium text-muted">{fact.label}</dt>
                <dd className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-fg sm:text-[40px]">{fact.value}</dd>
                <dd className="mt-3 text-xs text-muted/90">{fact.sub}</dd>
                {/* Gradient underline that grows on hover. */}
                <span aria-hidden className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-gradient-brand transition-transform duration-500 ease-expo group-hover:scale-x-100" />
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
