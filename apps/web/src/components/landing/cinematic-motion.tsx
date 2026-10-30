"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useStaticHero } from "./use-static-hero";
import s from "./cinematic.module.css";

export const ease = [.16, 1, .3, 1] as const;

export function Reveal({ children, className = "", delay = 0, focus = true }: { children: ReactNode; className?: string; delay?: number; focus?: boolean }) {
  const still = useStaticHero();
  return <motion.div className={className} initial={false} whileInView={still ? undefined : "visible"} viewport={{ once: true, amount: .12 }}>
    <motion.div initial={false} variants={{ visible: { opacity: [0,1], y: [16,0], ...(focus ? {filter: ["blur(8px)","blur(0px)"]} : {}) } }} transition={{ duration: .7, delay, ease }}>{children}</motion.div>
  </motion.div>;
}

export function SectionTitle({ id, first, accent }: { id: string; first: string; accent: string }) {
  const still = useStaticHero();
  return <motion.h2 id={id} className={s.title} initial={false} whileInView={still ? undefined : "visible"} viewport={{ once: true, amount: .3 }}>
    {[first, accent].map((line, index) => <span className={s.mask} key={line}><motion.span className={index ? s.serif : undefined} variants={{ visible: { y: ["105%","0%"], opacity: [0,1] } }} transition={{ duration: 1.05, delay: index * .075, ease }}>{line}</motion.span></span>)}
  </motion.h2>;
}

export function NumberOnce({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const still = useStaticHero();
  const played = useRef(false);
  useEffect(() => {
    if (!visible || still || played.current) return;
    played.current = true;
    const controls = animate(0, value, { duration: 1.05, ease, onUpdate: latest => { if (ref.current) ref.current.textContent = `${prefix}${latest.toLocaleString("en-US", {minimumFractionDigits:decimals,maximumFractionDigits:decimals})}${suffix}`; } });
    return () => controls.stop();
  }, [visible, still, value, decimals, prefix, suffix]);
  return <span ref={ref}>{prefix}{value.toLocaleString("en-US", {minimumFractionDigits:decimals,maximumFractionDigits:decimals})}{suffix}</span>;
}
