import Link from "next/link";
import { useId } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/**
 * The rising-line path inside the logo, in a 32 × 32 box. The 3D coin on the
 * landing page (components/landing/three/coin.tsx) uses the same points.
 */
export const LOGO_LINE: [number, number][] = [
  [8, 22],
  [13.5, 16.5],
  [17.5, 20],
  [24, 11],
];
export const LOGO_ARROW: [number, number][] = [
  [18.5, 11],
  [24, 11],
  [24, 16.5],
];

const toPath = (points: [number, number][]) => points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");

/** Gradient square with a rising line and arrow. Colours follow the live palette. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-1)" />
          <stop offset="0.55" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent-3)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#lg-${id})`} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <path
        d={`${toPath(LOGO_LINE)} ${toPath(LOGO_ARROW)}`}
        fill="none"
        stroke="#05070D"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)} aria-label={`${brand.name} home`}>
      <LogoMark className="size-8 transition-transform duration-500 ease-expo group-hover:rotate-[8deg] group-hover:scale-105" />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg">
        {brand.shortName}
        <span className="font-normal text-muted"> {brand.name.replace(brand.shortName, "").trim()}</span>
      </span>
    </Link>
  );
}
