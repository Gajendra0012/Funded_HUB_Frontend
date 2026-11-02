"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Endless sideways scroll. The children are drawn twice side by side and the
 * track slides left by half its width, so the loop has no visible jump.
 * It pauses while off screen and when hovered (CSS in theme.css: .marquee).
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  gap = 16,
  fade = true,
  className,
  label,
}: {
  children: ReactNode;
  /** Seconds for one full loop. Bigger is slower. */
  duration?: number;
  reverse?: boolean;
  gap?: number;
  /** Fade the left and right edges. */
  fade?: boolean;
  className?: string;
  /** Accessible name for the scrolling region. */
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const group: CSSProperties = { gap, paddingRight: gap };

  return (
    <div
      ref={ref}
      role={label ? "region" : undefined}
      aria-label={label}
      className={cn("marquee flex overflow-hidden", fade && "mask-fade-x", className)}
      data-reverse={reverse}
      data-paused={!inView}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className="marquee-track flex w-max shrink-0">
        <div className="flex shrink-0 items-stretch" style={group}>
          {children}
        </div>
        {/* The copy is only for the visual loop, so screen readers skip it. */}
        <div aria-hidden className="flex shrink-0 items-stretch" style={group}>
          {children}
        </div>
      </div>
    </div>
  );
}
