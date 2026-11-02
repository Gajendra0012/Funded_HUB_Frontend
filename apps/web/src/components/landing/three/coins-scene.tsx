"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Coin, Crystal } from "./coin";
import { COLORS, SceneCanvas } from "./scene-canvas";

/*
 * Floating coins and gems, used in the hero and in the final call to action.
 * Each object floats up and down, spins slowly, and the whole group leans a
 * little towards the mouse pointer.
 */

export type Placement = {
  kind: "coin" | "crystal";
  /** Position as a fraction of the visible area: x -1 = left edge, 1 = right edge; y -1 = bottom, 1 = top. */
  x: number;
  y: number;
  /** Depth: negative is further away. */
  z: number;
  size: number;
  /** Colour of the coin's logo (coins only). */
  accent?: string;
  /** Turns per second around the vertical axis (roughly). */
  spin?: number;
};

/**
 * Around the hero's dashboard card. The card's floating chips sit at its top-right
 * and bottom-left corners, so the objects keep to the other corners and the sides.
 */
export const HERO_PLACEMENTS: Placement[] = [
  { kind: "coin", x: -0.8, y: 0.62, z: -1.2, size: 0.85, spin: 0.35 },
  { kind: "coin", x: 0.9, y: 0.12, z: -0.4, size: 0.34, accent: COLORS.accent3, spin: -0.6 },
  { kind: "crystal", x: 0.8, y: -0.8, z: 0.3, size: 0.3, spin: 0.5 },
  { kind: "coin", x: -0.6, y: -0.8, z: 0.2, size: 0.26, accent: COLORS.accent2, spin: 0.7 },
];

/** Left and right of the final call-to-action text. */
export const CTA_PLACEMENTS: Placement[] = [
  { kind: "coin", x: -0.78, y: 0.2, z: -0.6, size: 0.75, spin: 0.4 },
  { kind: "crystal", x: -0.62, y: -0.55, z: 0.2, size: 0.24, spin: 0.6 },
  { kind: "coin", x: 0.8, y: -0.15, z: -0.4, size: 0.6, accent: COLORS.accent3, spin: -0.45 },
  { kind: "coin", x: 0.62, y: 0.62, z: 0.3, size: 0.24, accent: COLORS.accent2, spin: 0.8 },
];

/** Mouse position over the whole window, from -1 to 1 on each axis (0 = centre). */
function useWindowPointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

/** Rotates its children around the vertical axis at `speed`. */
function Spin({ speed, children, ...groupProps }: ThreeElements["group"] & { speed: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed * Math.PI;
  });
  return (
    <group ref={ref} {...groupProps}>
      {children}
    </group>
  );
}

function FloatingObjects({ placements }: { placements: Placement[] }) {
  const group = useRef<Group>(null);
  const pointer = useWindowPointer();
  const viewport = useThree((state) => state.viewport);

  // Every frame, ease the group's tilt towards the pointer (no sudden jumps).
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const ease = Math.min(1, delta * 3);
    g.rotation.y += (pointer.current.x * 0.25 - g.rotation.y) * ease;
    g.rotation.x += (pointer.current.y * 0.15 - g.rotation.x) * ease;
  });

  return (
    <group ref={group}>
      {placements.map((p, i) => (
        <Float key={i} speed={1.2 + i * 0.25} rotationIntensity={0.35} floatIntensity={0.7}>
          <group position={[(p.x * viewport.width) / 2, (p.y * viewport.height) / 2, p.z]} rotation={[0.3, 0, 0.12 * (i % 2 ? 1 : -1)]}>
            <Spin speed={p.spin ?? 0.4} rotation-y={i * 1.3}>
              {p.kind === "coin" ? <Coin radius={p.size} accent={p.accent} /> : <Crystal size={p.size} />}
            </Spin>
          </group>
        </Float>
      ))}
    </group>
  );
}

/** `variant` picks the layout: around the hero card, or beside the final call to action. */
export default function CoinsScene({ variant, className }: { variant: "hero" | "cta"; className?: string }) {
  return (
    <SceneCanvas className={className}>
      <FloatingObjects placements={variant === "hero" ? HERO_PLACEMENTS : CTA_PLACEMENTS} />
    </SceneCanvas>
  );
}
