"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type Arc, type Marker } from "cobe";
import { useReducedMotionPref } from "@/lib/hooks";

/*
 * Dotted 3D globe (made with the small "cobe" WebGL library, not three.js).
 * It spins slowly, can be dragged sideways, pauses while off screen,
 * and pulses the city markers. Arcs show rewards travelling from Dubai.
 */

type RGB = [number, number, number];

/** "#00e5a0" → [0, 0.9, 0.63] (the 0–1 colour format cobe uses). */
function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const MARKER_COLOR = hexToRgb("#00e5a0"); // accent 1
const ARC_COLOR = hexToRgb("#00b3ff"); // accent 2
const GLOW_COLOR: RGB = hexToRgb("#00b3ff").map((c) => c * 0.32) as RGB;

export default function Globe({ markers, arcs = [], label }: { markers: Marker[]; arcs?: Arc[]; label: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPref();
  // Kept in refs so new arcs show up without rebuilding the globe.
  const markersRef = useRef(markers);
  const arcsRef = useRef(arcs);
  useEffect(() => {
    markersRef.current = markers;
    arcsRef.current = arcs;
  }, [markers, arcs]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let width = wrapper.offsetWidth || 400;
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width,
      height: width,
      phi: 4.4,
      theta: 0.3,
      dark: 1,
      diffuse: 1.25,
      mapSamples: width < 460 ? 11000 : 20000,
      mapBrightness: 5.5,
      mapBaseBrightness: 0.03,
      baseColor: [0.17, 0.21, 0.3],
      markerColor: MARKER_COLOR,
      glowColor: GLOW_COLOR,
      markers: markersRef.current,
      arcs: arcsRef.current,
      arcColor: ARC_COLOR,
      arcWidth: 0.55,
      arcHeight: 0.28,
      markerElevation: 0.015,
      opacity: 0.95,
    });
    canvas.style.opacity = "1";

    // Rotation: `phi` turns by itself, `drag` is added while the user drags.
    let phi = 4.4;
    let drag = 0;
    let dragStart: { x: number; drag: number } | null = null;
    let frame = 0;
    let animationId = 0;

    const draw = () => {
      frame += 1;
      if (!dragStart) phi += reduced ? 0.0008 : 0.0032;
      const pulsing = reduced
        ? markersRef.current
        : markersRef.current.map((m, i) => ({ ...m, size: m.size * (1 + 0.38 * Math.sin(frame * 0.045 + i * 1.7)) }));
      globe.update({ phi: phi + drag, markers: pulsing, arcs: arcsRef.current });
      animationId = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(draw);
    };
    const stop = () => cancelAnimationFrame(animationId);

    // Only animate while the globe is on screen.
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: "80px" });
    visibility.observe(wrapper);

    // Keep the globe sharp when the layout width changes.
    const resize = new ResizeObserver(() => {
      const newWidth = wrapper.offsetWidth;
      if (newWidth && Math.abs(newWidth - width) > 2) {
        width = newWidth;
        globe.update({ width, height: width });
      }
    });
    resize.observe(wrapper);

    const onDown = (e: PointerEvent) => {
      dragStart = { x: e.clientX, drag };
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (dragStart) drag = dragStart.drag + (e.clientX - dragStart.x) / 180;
    };
    const onUp = () => {
      dragStart = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      globe.destroy();
    };
  }, [reduced]);

  return (
    <div ref={wrapperRef} className="relative aspect-square w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="h-full w-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000 [contain:layout_paint_size]"
      />
    </div>
  );
}
