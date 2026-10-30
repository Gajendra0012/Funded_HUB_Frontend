"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { manageWorldPlayback } from "./world-playback";
import { useStaticHero } from "./use-static-hero";
import s from "./cinematic.module.css";

const Network = dynamic(()=>import("./node-network"),{ssr:false});

export function World({ hero, end, paused }: { hero: RefObject<HTMLDivElement|null>; end: RefObject<HTMLDivElement|null>; paused: boolean }) {
  const still = useStaticHero();
  const first = useRef<HTMLVideoElement>(null), final = useRef<HTMLVideoElement>(null);
  const [nearFinal,setNearFinal] = useState(false);
  const [zone,setZone] = useState<"hero"|"middle"|"final">("hero");
  const {scrollYProgress} = useScroll({target:hero,offset:["start start","end start"]});
  const scale = useTransform(scrollYProgress,[0,1],still?[1,1]:[1,.82]);
  const opacity = useTransform(scrollYProgress,[0,.8,1],[1,.12,0]);
  const {scrollYProgress:ending} = useScroll({target:end,offset:["start end","start start"]});
  const finalOpacity=useTransform(ending,[0,.6,1],[0,.7,1]);
  const finalScale=useTransform(ending,[0,1],still?[1,1]:[1.12,1]);
  useMotionValueEvent(scrollYProgress,"change",value=>{if(value<.95&&zone!=="hero")setZone("hero");else if(value>=.95&&zone==="hero")setZone("middle");});
  useEffect(()=>{
    first.current?.load();
  },[still]);
  useEffect(()=>{
    const target=end.current;
    if(!target)return;
    const near=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)setNearFinal(true);},{rootMargin:"600px"});
    const visible=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&entry.intersectionRatio>.12)setZone("final");else if(window.scrollY>innerHeight*.95)setZone("middle");},{threshold:[0,.12]});
    near.observe(target);visible.observe(target);
    return ()=>{near.disconnect();visible.disconnect();};
  },[end]);
  useEffect(()=>manageWorldPlayback(first.current,final.current,zone,still||paused),[zone,still,paused,nearFinal]);
  return <div className={s.world} aria-hidden="true">
    <div className={s.midStill}/>
    <motion.div className={s.worldPlanet} style={{scale,opacity}}>
      <video ref={first} poster="/video/hero-poster.jpg" muted loop playsInline disablePictureInPicture preload={still?"none":"metadata"}>
        {!still&&<><source src="/video/hero-mobile.mp4" media="(max-width: 767px)" type="video/mp4"/><source src="/video/hero.mp4" type="video/mp4"/></>}
      </video>
    </motion.div>
    <motion.div className={`${s.worldPlanet} ${s.returnPlanet}`} style={{opacity:finalOpacity,scale:finalScale,rotate:still?0:-6}}>
      {nearFinal&&<video ref={final} poster="/video/hero-poster.jpg" muted loop playsInline disablePictureInPicture preload={still?"none":"metadata"}>{!still&&<><source src="/video/hero-mobile.mp4" media="(max-width: 767px)" type="video/mp4"/><source src="/video/hero.mp4" type="video/mp4"/></>}</video>}
    </motion.div>
    {!still&&zone==="middle"&&<Network active={!paused}/>}
    <div className={s.worldShade}/>
  </div>;
}
