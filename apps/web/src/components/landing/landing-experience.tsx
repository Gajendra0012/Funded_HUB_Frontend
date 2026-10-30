"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Landing } from "./landing";
import { useStaticHero } from "./use-static-hero";
import { SampleTradingProvider, TradingDashboard } from "./hero-trading";
import { World } from "./world";
import s from "./cinematic.module.css";

const Journey=dynamic(()=>import("./cinematic-sections").then(m=>m.Journey));
const Risk=dynamic(()=>import("./cinematic-sections").then(m=>m.RiskMonitor));
const Programs=dynamic(()=>import("./cinematic-sections").then(m=>m.Programs));
const Payouts=dynamic(()=>import("./cinematic-sections").then(m=>m.Payouts));
const Closing=dynamic(()=>import("./cinematic-sections").then(m=>m.Closing));

function LazySection({id,children}: {id:string;children:ReactNode}){
  const ref=useRef<HTMLDivElement>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setReady(true);observer.disconnect();}},{rootMargin:"600px"});
    if(ref.current)observer.observe(ref.current);
    return ()=>observer.disconnect();
  },[]);
  return <div ref={ref} id={id} className={s.lazySection} data-section={id}>{ready?children:<div className={s.sectionPlaceholder} aria-busy="true"><span>Funded HUB / {id.replaceAll("-"," ")}</span></div>}</div>;
}

export function LandingExperience({className}: {className:string}){
  const hero=useRef<HTMLDivElement>(null),end=useRef<HTMLDivElement>(null);
  const [paused,setPaused]=useState(false);
  const [pastHero,setPastHero]=useState(false);
  const still=useStaticHero();
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setPastHero(!entry.isIntersecting));if(hero.current)observer.observe(hero.current);return ()=>observer.disconnect();},[]);
  return <div className={`${s.experience} ${className}`}>
    <World hero={hero} end={end} paused={paused}/>
    <SampleTradingProvider>
      <div ref={hero} className={s.heroWrap}><Landing background={null} paused={paused} hasTradingDashboard/></div>
      <TradingDashboard/>
    </SampleTradingProvider>
    <div className={s.sectionLabel}><span>CRYPTO ONLY. ALWAYS IN PERSPECTIVE.</span><span aria-hidden="true">SCROLL TO EXPLORE ↓</span></div>
    <LazySection id="how-it-works"><Journey/></LazySection>
    <LazySection id="risk-monitor"><Risk/></LazySection>
    <LazySection id="programs"><Programs/></LazySection>
    <LazySection id="payouts"><Payouts/></LazySection>
    <div ref={end}><LazySection id="next-chapter"><Closing/></LazySection></div>
    {!still&&pastHero&&<button className={s.worldControl} type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?"Resume background":"Pause background"}</button>}
  </div>;
}
