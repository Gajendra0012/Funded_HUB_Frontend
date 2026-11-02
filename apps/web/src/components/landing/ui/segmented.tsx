"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * A row of options where exactly one is selected (like tabs).
 * The highlight slides to the chosen option.
 * `style="gradient"` is for the main choice, `"glass"` for a secondary one.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  style = "glass",
  size = "md",
  fullWidth = false,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name, e.g. "Challenge program". */
  label: string;
  style?: "gradient" | "glass";
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}) {
  const highlightId = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("relative flex gap-1 rounded-2xl border border-line bg-white/[0.025] p-1", fullWidth ? "w-full" : "w-fit", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative isolate flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors duration-200",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
              fullWidth && "flex-1",
              active ? (style === "gradient" ? "text-ink" : "text-fg") : "text-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={highlightId}
                aria-hidden
                className={cn(
                  "absolute inset-0 -z-10 rounded-xl",
                  style === "gradient"
                    ? "bg-gradient-brand shadow-[0_6px_24px_-8px_var(--accent-1)]"
                    : "border border-accent-2/40 bg-accent-2/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_-8px_var(--accent-2)]",
                )}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
