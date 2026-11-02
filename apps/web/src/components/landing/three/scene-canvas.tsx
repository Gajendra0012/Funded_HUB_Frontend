"use client";

import { useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useInView } from "motion/react";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/hooks";

/**
 * Colours for the 3D scenes. WebGL can't read CSS variables,
 * so keep these in sync with the accents in theme.css (:root).
 */
export const COLORS = {
  accent1: "#00e5a0",
  accent2: "#00b3ff",
  accent3: "#7c5cff",
  profit: "#00d395",
  loss: "#ff4d5e",
} as const;

/**
 * Shared setup for every 3D scene on the page:
 *  - transparent background, so the page shows through;
 *  - studio lighting with coloured reflections (generated in code, no image downloads);
 *  - stops drawing while off screen, and draws a single still frame for reduced motion;
 *  - hidden from screen readers and mouse clicks (it is decoration only).
 */
export function SceneCanvas({
  children,
  cameraZ = 7,
  className,
}: {
  children: ReactNode;
  /** Distance of the camera from the centre. Bigger shows more of the scene. */
  cameraZ?: number;
  /** Position and size of the canvas (Tailwind classes). Defaults to covering its parent. */
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(wrapperRef, { margin: "100px" });
  const reduced = useReducedMotionPref();
  // "always" = animate every frame, "never" = keep the last frame, "demand" = draw once.
  const frameloop = reduced ? "demand" : onScreen ? "always" : "never";

  return (
    <div ref={wrapperRef} aria-hidden className={cn("pointer-events-none absolute", className ?? "inset-0")}>
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, cameraZ], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, -2, 2]} intensity={0.6} color={COLORS.accent3} />
        {/* Reflections: glowing panels in the brand colours that the metal surfaces mirror. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="ring" intensity={2.5} color={COLORS.accent1} position={[-5, 2, 3]} scale={3} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={3} color={COLORS.accent2} position={[5, 1, 4]} scale={[4, 2, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={2.5} color={COLORS.accent3} position={[0, -5, 2]} scale={[6, 1.5, 1]} target={[0, 0, 0]} />
          <Lightformer form="circle" intensity={4} color="#ffffff" position={[0, 5, 3]} scale={2} target={[0, 0, 0]} />
        </Environment>
        {children}
      </Canvas>
    </div>
  );
}
