"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { useMediaQuery, useReducedMotionPref } from "@/lib/hooks";

/**
 * Tilts its content slightly towards the mouse pointer, for a 3D feel.
 * Children with `[transform:translateZ(…)]` float above the card while it tilts.
 * Only on devices with a mouse, and never for reduced motion.
 */
export function TiltCard({ children, maxDegrees = 7, className }: { children: ReactNode; maxDegrees?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasMouse = useMediaQuery("(pointer: fine)");
  const reduced = useReducedMotionPref();
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (!hasMouse || reduced) return;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    const onMove = (event: PointerEvent) => {
      const card = ref.current?.getBoundingClientRect();
      if (!card) return;
      // -1 … 1: how far the pointer is from the card's centre, relative to the window.
      const x = clamp(((event.clientX - (card.left + card.width / 2)) / window.innerWidth) * 2);
      const y = clamp(((event.clientY - (card.top + card.height / 2)) / window.innerHeight) * 2);
      rotateY.set(x * maxDegrees);
      rotateX.set(-y * maxDegrees);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [hasMouse, reduced, maxDegrees, rotateX, rotateY]);

  return (
    <div className={className} style={{ perspective: 1200 }}>
      <motion.div ref={ref} className="relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
