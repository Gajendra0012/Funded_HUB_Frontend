"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import styles from "./landing.module.css";

const Crystal = dynamic(() => import("./crystal"), { ssr: false });

export function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const [enabled, setEnabled] = useState(false);
  const [awake, setAwake] = useState(true);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const query = matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(query.matches && Boolean(document.createElement("canvas").getContext("webgl2")));
    const visibility = () => setAwake(!document.hidden);
    update(); visibility();
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => { query.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div className={styles.art} ref={ref}>
    <div className={styles.artVisual} aria-hidden="true"><div className={styles.poster}><div className={styles.posterFacet} /></div>
      {/* Phones and reduced-motion users never request the WebGL chunk. */}
      {enabled && <Crystal active={visible && awake && !paused} />}
    </div>
    {/* Idle rotation is continuous, so expose an explicit keyboard-accessible pause control. */}
    {enabled && <button type="button" className={styles.artToggle} onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused ? "Resume crystal" : "Pause crystal"}</button>}
  </div>;
}
