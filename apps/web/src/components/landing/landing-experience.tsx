"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Landing } from "./landing";
import { useStaticHero } from "./use-static-hero";
import { SampleTradingProvider, TradingDashboard } from "./hero-trading";
import { Journey, RiskMonitor as Risk, Programs, Payouts, Closing } from "./cinematic-sections";
import { HeroDataRails } from "./hero-data-rails";
import { World } from "./world";
import s from "./cinematic.module.css";

function PageSection({id,children}: {id:string;children:ReactNode}){
  return <div id={id} className={s.lazySection} data-section={id}>{children}</div>;
}

export function LandingExperience({className}: {className:string}){
  const hero=useRef<HTMLDivElement>(null),end=useRef<HTMLDivElement>(null);
  const [paused,setPaused]=useState(false);
  const [pastHero,setPastHero]=useState(false);
  const still=useStaticHero();
  useEffect(()=>{if(typeof IntersectionObserver === "undefined")return;const observer=new IntersectionObserver(([entry])=>setPastHero(!entry.isIntersecting));if(hero.current)observer.observe(hero.current);return ()=>observer.disconnect();},[]);
  return <div className={`${s.experience} ${className}`}>
    <World hero={hero} end={end} paused={paused}/>
    <SampleTradingProvider>
      <div ref={hero} className={s.heroWrap}><Landing background={null} paused={paused} hasTradingDashboard tradingLayer={<HeroDataRails/>}/></div>
      <TradingDashboard/>
    </SampleTradingProvider>
    <PageSection id="how-it-works"><Journey/></PageSection>
    <PageSection id="risk-monitor"><Risk/></PageSection>
    <PageSection id="programs"><Programs/></PageSection>
    <PageSection id="payouts"><Payouts/></PageSection>
    <div ref={end}><PageSection id="next-chapter"><Closing/></PageSection></div>
    {!still&&pastHero&&<button className={s.worldControl} type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?"Resume background":"Pause background"}</button>}
  </div>;
}
