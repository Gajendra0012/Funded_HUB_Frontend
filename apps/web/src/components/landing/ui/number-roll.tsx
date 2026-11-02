"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/components/landing/lib/format";
import { useReducedMotionPref } from "@/lib/hooks";

type Format = "usd" | "usd0" | "int";

const formatters: Record<Format, (value: number) => string> = {
  usd: (v) => formatUsd(v, 2),
  usd0: (v) => formatUsd(v, 0),
  int: (v) => Math.round(v).toLocaleString("en-US"),
};

/** Restarts the green/red flash animation (classes .tick-up / .tick-down in theme.css). */
function flashOnce(element: HTMLElement, className: "tick-up" | "tick-down") {
  element.classList.remove("tick-up", "tick-down");
  void element.offsetWidth; // forces the browser to restart the animation
  element.classList.add(className);
}

/**
 * A number that animates to its new value.
 *  - countUp: counts up from 0 the first time it scrolls into view.
 *  - flash:   briefly turns green or red when the value goes up or down.
 * The real value is in the server HTML, so it is never blank before JavaScript runs.
 */
export function NumberRoll({
  value,
  format = "int",
  countUp = false,
  flash = false,
  className,
}: {
  value: number;
  format?: Format;
  countUp?: boolean;
  flash?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotionPref();
  const [shown, setShown] = useState(value);
  const lastValue = useRef(value);
  const counted = useRef(false);

  useEffect(() => {
    if (reduced) return;
    if (countUp && !inView) return;

    let from = lastValue.current;
    if (countUp && !counted.current) {
      from = 0;
      counted.current = true;
    }
    if (from === value) return;

    if (flash && ref.current) flashOnce(ref.current, value > from ? "tick-up" : "tick-down");
    lastValue.current = value;
    const controls = animate(from, value, { duration: countUp ? 1.6 : 0.6, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [value, inView, countUp, flash, reduced]);

  return (
    <span ref={ref} className={cn("num inline-flex whitespace-nowrap rounded", className)}>
      {formatters[format](reduced ? value : shown)}
    </span>
  );
}
