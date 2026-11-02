import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Centres content and keeps it at most 1280px wide, with side padding on small screens. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Small glowing label above a section title, e.g. "• HOW IT WORKS". */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-1">
      <span className="size-1.5 rounded-full bg-accent-1 shadow-[0_0_8px_var(--accent-1)]" />
      {children}
    </span>
  );
}

/** Eyebrow + big title + optional subtitle. Used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  /** Set this to label the section for screen readers (aria-labelledby). */
  id?: string;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-4", align === "center" ? "mx-auto items-center text-center" : "items-start text-left")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[40px] lg:text-[48px]">
        {title}
      </h2>
      {subtitle && <p className="text-[15px] leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}

/** Pulsing dot that means "live" or "active". */
export function LiveDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("live-dot", className)} />;
}

/** Yellow-dot pill that marks sample (not real) data. */
export function SampleTag({ children = "Sample data", className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-warning shadow-[0_0_8px_var(--warning)]" />
      {children}
    </span>
  );
}

/** Round avatar with initials, e.g. "Arjun M." → "AM". */
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent-2)_22%,transparent),color-mix(in_oklab,var(--accent-3)_22%,transparent))] text-[11px] font-semibold text-fg"
    >
      {initials}
    </span>
  );
}
