import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/*
 * Decorative backgrounds. All of them are aria-hidden and use CSS animations
 * from theme.css, so they cost no JavaScript.
 */

type Beam = { direction: "v" | "h"; line: number; seconds: number; delay: number; color: 1 | 2 | 3; desktopOnly?: boolean };

// Fixed positions (same on server and browser). `line` is the grid line number (48px apart).
const BEAMS: Beam[] = [
  { direction: "v", line: 4, seconds: 9, delay: 0.5, color: 1 },
  { direction: "v", line: 11, seconds: 11, delay: 3.2, color: 2, desktopOnly: true },
  { direction: "v", line: 19, seconds: 8.5, delay: 1.6, color: 3 },
  { direction: "v", line: 27, seconds: 12, delay: 5.1, color: 1, desktopOnly: true },
  { direction: "v", line: 33, seconds: 10, delay: 2.4, color: 2, desktopOnly: true },
  { direction: "h", line: 3, seconds: 13, delay: 1.1, color: 2 },
  { direction: "h", line: 8, seconds: 15, delay: 6.3, color: 3, desktopOnly: true },
];

/** Faint 48px grid with small lights travelling along its lines. */
export function GridBeams({ beams = true, className }: { beams?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("grid-lines", className)}>
      {beams &&
        BEAMS.map((beam, i) => (
          <span
            key={i}
            className={cn(beam.direction === "v" ? "beam-v" : "beam-h", beam.desktopOnly && "hidden md:block")}
            style={
              {
                [beam.direction === "v" ? "left" : "top"]: `${beam.line * 48}px`,
                "--beam-dur": `${beam.seconds}s`,
                "--beam-delay": `${beam.delay}s`,
                "--beam-color": `var(--accent-${beam.color})`,
              } as CSSProperties
            }
          />
        ))}
    </div>
  );
}

/** Slow colour blobs + grid, behind the hero. Fades into the page colour at the bottom. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="aurora">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <GridBeams />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

/** A light that circles the border of its parent. The parent needs `relative` and rounded corners. */
export function BorderBeam({ seconds = 6, width = 1.5 }: { seconds?: number; width?: number }) {
  const style = { "--beam-duration": `${seconds}s`, "--beam-width": `${width}px` } as CSSProperties;
  return (
    <>
      <span aria-hidden className="border-beam-glow" style={style} />
      <span aria-hidden className="border-beam" style={style} />
    </>
  );
}
