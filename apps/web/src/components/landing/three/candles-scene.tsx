"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useReducedMotionPref } from "@/lib/hooks";
import { COLORS, SceneCanvas } from "./scene-canvas";

/*
 * A 3D candlestick chart for the "Platform" section.
 * The candles grow out of the floor one after another, a glowing average line
 * runs through them, and the chart slowly turns from side to side.
 */

const CANDLE_COUNT = 20;
const SPACING = 0.36; // distance between candles
const CHART_BOTTOM = -1.25; // lowest price sits here (3D units)
const CHART_HEIGHT = 2.7; // highest price sits this far above the bottom

/** Small random-number generator with a fixed seed, so the chart looks the same on every visit. */
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A made-up price series that trends upwards (like a passed challenge), already scaled to 3D heights. */
function makeCandles() {
  const random = seededRandom(7);
  const prices: { open: number; close: number; high: number; low: number }[] = [];
  let price = 0;
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const open = price;
    const close = open + (random() - 0.34) * 1.2;
    prices.push({ open, close, high: Math.max(open, close) + random() * 0.5, low: Math.min(open, close) - random() * 0.5 });
    price = close;
  }
  // Scale every price so the whole chart fits between CHART_BOTTOM and CHART_BOTTOM + CHART_HEIGHT.
  const lowest = Math.min(...prices.map((p) => p.low));
  const highest = Math.max(...prices.map((p) => p.high));
  const toY = (value: number) => CHART_BOTTOM + ((value - lowest) / (highest - lowest)) * CHART_HEIGHT;
  return prices.map((p, i) => ({
    x: (i - (CANDLE_COUNT - 1) / 2) * SPACING,
    up: p.close >= p.open,
    open: toY(p.open),
    close: toY(p.close),
    high: toY(p.high),
    low: toY(p.low),
  }));
}

/** The chart data, made once when the file loads. */
const CANDLES = makeCandles();
type Candle = (typeof CANDLES)[number];

/** One candle: a rounded body plus a thin wick. It grows up from its base after `delay` seconds. */
function CandleMesh({ candle, delay, still }: { candle: Candle; delay: number; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  // Seconds this candle has been on screen. (The scene's own clock restarts whenever
  // the scene pauses off screen, so each candle keeps its own count.)
  const age = useRef(0);
  const color = candle.up ? COLORS.profit : COLORS.loss;
  const bodyHeight = Math.max(Math.abs(candle.close - candle.open), 0.05);

  useFrame((_, delta) => {
    if (!ref.current) return;
    age.current += Math.min(delta, 0.1);
    // 0 → 1 over 0.8s with a soft ease-out. Full size at once for reduced motion.
    const t = still ? 1 : Math.min(1, Math.max(0, (age.current - delay) / 0.8));
    ref.current.scale.y = Math.max(1 - Math.pow(1 - t, 3), 0.001);
  });

  return (
    // Scaling from the chart floor, so candles rise out of it.
    <group ref={ref} position={[candle.x, CHART_BOTTOM, 0]}>
      <RoundedBox args={[0.22, bodyHeight, 0.22]} radius={0.03} position-y={(candle.open + candle.close) / 2 - CHART_BOTTOM}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.4} roughness={0.25} />
      </RoundedBox>
      <mesh position-y={(candle.high + candle.low) / 2 - CHART_BOTTOM}>
        <cylinderGeometry args={[0.014, 0.014, candle.high - candle.low, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Chart() {
  const group = useRef<THREE.Group>(null);
  const still = useReducedMotionPref();

  // Glowing moving-average line through the candle closes (average of the last 4).
  const averageLine = useMemo(() => {
    const points = CANDLES.map((candle, i) => {
      const recent = CANDLES.slice(Math.max(0, i - 3), i + 1);
      const average = recent.reduce((sum, c) => sum + c.close, 0) / recent.length;
      return new THREE.Vector3(candle.x, average, 0.2);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, 0.02, 8, false);
  }, []);

  // Slowly turn the chart from side to side.
  const time = useRef(0);
  useFrame((_, delta) => {
    time.current += Math.min(delta, 0.1);
    if (group.current) group.current.rotation.y = -0.42 + Math.sin(time.current * 0.25) * 0.15;
  });

  return (
    <group ref={group} rotation-x={0.14}>
      {CANDLES.map((candle, i) => (
        <CandleMesh key={i} candle={candle} delay={0.2 + i * 0.06} still={still} />
      ))}
      <mesh geometry={averageLine}>
        <meshStandardMaterial color={COLORS.accent2} emissive={COLORS.accent2} emissiveIntensity={1.2} />
      </mesh>
      {/* Faint floor grid under the candles. */}
      <gridHelper args={[10, 20, COLORS.accent2, "#1b2436"]} position-y={CHART_BOTTOM - 0.02} />
    </group>
  );
}

export default function CandlesScene({ className }: { className?: string }) {
  return (
    <SceneCanvas cameraZ={8} className={className}>
      <Chart />
    </SceneCanvas>
  );
}
