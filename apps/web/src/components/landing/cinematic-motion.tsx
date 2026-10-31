"use client";

import { animate, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useStaticHero } from "./use-static-hero";
import s from "./cinematic.module.css";

export const ease = [.16, 1, .3, 1] as const;

export function Reveal({ children, className = "", delay = 0, focus = true }: { children: ReactNode; className?: string; delay?: number; focus?: boolean }) {
  const still = useStaticHero();
  const canObserve = !still && typeof IntersectionObserver !== "undefined";
  return <motion.div className={className} initial={false} whileInView={canObserve ? "visible" : undefined} viewport={{ once: true, amount: .12 }}>
    <motion.div initial={false} variants={{ visible: { y: [focus ? 12 : 8,0] } }} transition={{ duration: .7, delay, ease }}>{children}</motion.div>
  </motion.div>;
}

export function SectionTitle({ id, first, accent, signature = false }: { id: string; first: string; accent: string; signature?: boolean }) {
  const still = useStaticHero();
  const canObserve = !still && typeof IntersectionObserver !== "undefined";
  return <motion.h2 id={id} className={s.title} initial={false} whileInView={canObserve ? "visible" : undefined} viewport={{ once: true, amount: .3 }}>
    {[first, accent].map((line, index) => <span className={s.mask} key={line}><motion.span className={signature && index ? s.serif : undefined} variants={{ visible: { y: ["12%","0%"] } }} transition={{ duration: 1.05, delay: index * .075, ease }}>{line}</motion.span></span>)}
  </motion.h2>;
}

export function NumberOnce({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const still = useStaticHero();
  const played = useRef(false);
  useEffect(() => {
    if (still || played.current || !ref.current || typeof IntersectionObserver === "undefined") return;
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || played.current) return;
      played.current = true; observer.disconnect();
      const controls = animate(0, value, { duration: 1.05, ease, onUpdate: latest => { if (ref.current) ref.current.textContent = `${prefix}${latest.toLocaleString("en-US", {minimumFractionDigits:decimals,maximumFractionDigits:decimals})}${suffix}`; } });
      stop = () => controls.stop();
    });
    observer.observe(ref.current);
    return () => { observer.disconnect(); stop?.(); };
  }, [still, value, decimals, prefix, suffix]);
  return <span ref={ref}>{prefix}{value.toLocaleString("en-US", {minimumFractionDigits:decimals,maximumFractionDigits:decimals})}{suffix}</span>;
}
