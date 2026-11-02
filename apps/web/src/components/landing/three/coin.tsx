"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { LOGO_ARROW, LOGO_LINE } from "@/components/ui/Logo";
import { COLORS } from "./scene-canvas";

/*
 * 3D models, built entirely in code (no model files to download):
 *  - Coin:    the Funded HUB coin — dark metal disc, chrome rim, glowing ring and logo on both faces.
 *  - Crystal: a glass gem, used as a smaller accent next to the coins.
 */

type GroupProps = ThreeElements["group"];

/** Turns the logo's 2D points (32 × 32 box, see components/ui/Logo.tsx) into 3D points on a coin face. */
function logoPointsOnCoin(points: [number, number][], radius: number) {
  const unit = radius / 15; // the logo is 16 units wide → about 1.07 × the radius
  return points.map(([x, y]) => new THREE.Vector3((x - 16) * unit, -(y - 16.5) * unit, 0));
}

/** A round tube that follows straight lines through `points` (like a thick 3D pen stroke). */
function tubeThrough(points: THREE.Vector3[], thickness: number) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 0; i < points.length - 1; i++) path.add(new THREE.LineCurve3(points[i], points[i + 1]));
  return new THREE.TubeGeometry(path, 64, thickness, 12, false);
}

export function Coin({ radius = 1, accent = COLORS.accent1, ...groupProps }: GroupProps & { radius?: number; accent?: string }) {
  const thickness = radius * 0.16;

  // Built once per size: the logo tubes, the round "joints" at their corners, and the shared glow material.
  const logo = useMemo(() => {
    const line = logoPointsOnCoin(LOGO_LINE, radius);
    const arrow = logoPointsOnCoin(LOGO_ARROW, radius);
    const stroke = radius * 0.055;
    return {
      stroke,
      line: tubeThrough(line, stroke),
      arrow: tubeThrough(arrow, stroke),
      joints: [...line, ...arrow],
    };
  }, [radius]);

  const glow = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.85, metalness: 0.3, roughness: 0.35 }),
    [accent],
  );

  return (
    <group {...groupProps}>
      {/* Body: a short cylinder, turned to face the camera. */}
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[radius * 0.95, radius * 0.95, thickness, 96]} />
        <meshPhysicalMaterial color="#141c2e" metalness={1} roughness={0.3} clearcoat={1} clearcoatRoughness={0.2} />
      </mesh>

      {/* Rounded chrome rim around the edge. */}
      <mesh>
        <torusGeometry args={[radius * 0.95, thickness / 2, 32, 160]} />
        <meshPhysicalMaterial color="#e6eef9" metalness={1} roughness={0.15} clearcoat={1} />
      </mesh>

      {/* Front (side 0) and back (side 1, turned around) each get a ring and the logo. */}
      {[0, 1].map((side) => (
        <group key={side} rotation-y={side * Math.PI}>
          <mesh position-z={thickness / 2}>
            <torusGeometry args={[radius * 0.74, radius * 0.02, 16, 160]} />
            <meshStandardMaterial color={COLORS.accent2} emissive={COLORS.accent2} emissiveIntensity={0.7} />
          </mesh>
          <group position-z={thickness / 2 + logo.stroke * 0.6}>
            <mesh geometry={logo.line} material={glow} />
            <mesh geometry={logo.arrow} material={glow} />
            {logo.joints.map((point, i) => (
              <mesh key={i} position={point} material={glow}>
                <sphereGeometry args={[logo.stroke, 16, 16]} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

/** A clear glass gem with a rainbow sheen. */
export function Crystal({ size = 0.4, ...groupProps }: GroupProps & { size?: number }) {
  return (
    <group {...groupProps}>
      <mesh scale={[1, 1.5, 1]}>
        <octahedronGeometry args={[size, 0]} />
        <meshPhysicalMaterial
          color="#c9bcff"
          metalness={0.1}
          roughness={0.05}
          transmission={1}
          thickness={size}
          ior={1.5}
          iridescence={1}
          iridescenceIOR={1.3}
          clearcoat={1}
          flatShading
        />
      </mesh>
    </group>
  );
}
