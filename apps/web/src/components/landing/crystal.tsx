"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll, type MotionValue } from "motion/react";
import { Color, Mesh, MathUtils, PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function Environment() {
  const { gl } = useThree();
  // R3F attaches the generated texture declaratively; dispose it when the canvas unmounts.
  const environment = useMemo(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(room, 0.04, 0.1, 100);
    room.dispose(); generator.dispose();
    return target;
  }, [gl]);
  useEffect(() => () => environment.dispose(), [environment]);
  return <primitive object={environment.texture} attach="environment" />;
}
function Facet({ scroll, palette }: { scroll: MotionValue<number>; palette: string[] }) {
  const mesh = useRef<Mesh>(null);
  const angle = useRef(0.55);
  useFrame(({ pointer }, delta) => {
    if (!mesh.current) return;
    const dt = Math.min(delta, 0.05); // Avoid a rotation jump when an off-screen/paused canvas resumes.
    angle.current += dt * 0.055;
    mesh.current.rotation.x = MathUtils.damp(mesh.current.rotation.x, 0.25 + pointer.y * 0.12 + scroll.get() * 0.25, 4, dt);
    mesh.current.rotation.y = MathUtils.damp(mesh.current.rotation.y, angle.current + pointer.x * 0.18, 4, dt);
  });
  return <mesh ref={mesh} rotation={[0.25, 0.55, -0.22]} scale={[1.35, 2.05, 1.15]}>
    <icosahedronGeometry args={[1.5, 0]} />
    <meshPhysicalMaterial color={palette[2]} attenuationColor={palette[4]} attenuationDistance={3} metalness={0.02} roughness={0.04} transmission={0.85} thickness={1.4} ior={1.45} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.25} flatShading
      onBeforeCompile={shader => {
        // Add a blue view-angle rim to the physical material's existing Fresnel reflections.
        shader.uniforms.rimColor = { value: new Color(palette[2]) };
        shader.fragmentShader = "uniform vec3 rimColor;\n" + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", "float rim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);\noutgoingLight += rimColor * rim * 1.4;\n#include <opaque_fragment>");
      }} />
  </mesh>;
}

export default function Crystal({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<string[]>();
  const [contextLost, setContextLost] = useState(false);
  const [generation, setGeneration] = useState(0);
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    const tokens = getComputedStyle(host.current!);
    setPalette(["--text", "--accent-1", "--accent-2", "--bg", "--landing-tint"].map(name => tokens.getPropertyValue(name).trim()));
  }, []);
  return <div ref={host} data-context-lost={contextLost} style={{ position: "absolute", inset: 0 }}>
    {palette && <Canvas dpr={[1, 1.5]} frameloop={active && !contextLost ? "always" : "never"} camera={{ position: [0, 0, 8.5], fov: 42 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", event => { event.preventDefault(); setContextLost(true); });
        gl.domElement.addEventListener("webglcontextrestored", () => { setGeneration(value => value + 1); setContextLost(false); });
      }}>
      <Environment key={generation} />
      <ambientLight intensity={0.5} color={palette[3]} />
      <directionalLight position={[4, 4, -3]} color={palette[2]} intensity={8} />
      <directionalLight position={[-4, 2, 3]} color={palette[3]} intensity={3} />
      <Facet scroll={scrollYProgress} palette={palette} />
    </Canvas>}
  </div>;
}
