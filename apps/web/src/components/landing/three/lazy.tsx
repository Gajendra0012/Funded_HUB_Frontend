"use client";

import { Component, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";

/*
 * How the 3D parts are loaded.
 *
 * three.js and the globe are large, so they are:
 *  1. never rendered on the server (ssr: false),
 *  2. downloaded only when their section is close to the screen (<WhenNearScreen>),
 *  3. wrapped in <Safe3D>, so a browser without WebGL just shows the page without them.
 *
 * Sections import the 3D parts from this file only, never directly.
 */

export const CoinsScene = dynamic(() => import("./coins-scene"), { ssr: false });
export const CandlesScene = dynamic(() => import("./candles-scene"), { ssr: false });
export const Globe = dynamic(() => import("./globe"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.05),transparent)]" />,
});

/** Renders its children only once they come within 400px of the screen. */
export function WhenNearScreen({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "400px" });
  return (
    <div ref={ref} className={className}>
      {near && children}
    </div>
  );
}

/** If a 3D part crashes (for example no WebGL support), hide it instead of breaking the page. */
export class Safe3D extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
