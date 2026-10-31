"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useStaticHero } from "./use-static-hero";
import { chartPath, equityPoints, opening, programs, severity, simulateDay } from "./cinematic-data";
import { ease, NumberOnce, Reveal, SectionTitle } from "./cinematic-motion";
import s from "./cinematic.module.css";

const steps=[
  {title:"Choose a program",text:"1-Step, 2-Step or Instant, with simulated accounts from $5K to $200K. Every target and loss limit is shown before you pay.",note:"Reference figures"},
  {title:"Trade on Bybit Demo",text:"Connect a dedicated Demo sub-account with an API key. You place every order yourself on Bybit; we never trade for you. Funded HUB tracks your progress and limits."},
  {title:"Earn a share of real profit",text:"Meet the targets, pass review, then request a payout in USDT, USDC or BTC. Rewards are paid by the firm after review."},
];

function Arrow(){return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function Sparkline({values,id}: {values:readonly number[];id:string}){
  const path=chartPath(values,600,170);
  return <svg viewBox="0 0 600 170" className={s.sparkline} fill="none" role="img" aria-label="Illustrative account progress, not historical performance"><defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#9DC3E6" stopOpacity=".2"/><stop offset="1" stopColor="#9DC3E6" stopOpacity="0"/></linearGradient></defs><path d={`${path} L600 170 L0 170 Z`} fill={`url(#${id})`}/><path d={path} stroke="#9DC3E6" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>;
}

function JourneyVisual({active}: {active:number}){
  return <div className={`${s.glass} ${s.journeyVisual}`}>
    <div className={s.instrumentTop}><span className={s.eyebrow}>PROGRAM SETUP</span><span className={s.serial}>0{active+1} / 03</span></div>
    <div className={s.visualWindow}>
      <div className={s.visualScene} data-active={active===0} aria-hidden={active!==0} inert={active!==0}>
        <span className={s.smallLabel}>CHALLENGE CONFIGURATION</span><div className={s.configTitle}>Choose your program</div>
        <div className={s.programChips}><span>1-Step</span><span className={s.selectedChip}>2-Step</span><span>Instant</span></div>
        <div className={s.accountValue}>$<NumberOnce value={100000}/></div><span className={s.smallLabel}>SIMULATED ACCOUNT SIZE</span>
        <div className={s.sizeChips}>{["$5K","$10K","$25K","$50K","$100K"].map(size=><span key={size} data-selected={size==="$100K"}>{size}</span>)}</div>
        <p className={s.visualNote}>Reference figures. Choose your size, understand your targets, and keep your risk limits in view.</p>
      </div>
      <div className={s.visualScene} data-active={active===1} aria-hidden={active!==1} inert={active!==1}>
        <span className={s.smallLabel}>YOUR EXECUTION ENVIRONMENT</span><div className={s.bybit}>BYBIT<span>DEMO TRADING</span></div>
        <div className={s.connection}><i aria-hidden="true"/>Connected to Bybit Demo</div>
        <p className={s.visualNote}>Sample connection · no account linked</p>
        <ul className={s.permissions}><li><span>Read account</span><b aria-label="included">✓</b></li><li><span>Trade data</span><b aria-label="included">✓</b></li><li><span>Wallet balances</span><b aria-label="included">✓</b></li><li><span>No withdrawals</span><b aria-label="not permitted">−</b></li></ul>
      </div>
      <div className={s.visualScene} data-active={active===2} aria-hidden={active!==2} inert={active!==2}>
        <span className={s.smallLabel}>SAMPLE EVALUATION</span><div className={s.configTitle}>Evaluation progress</div>
        <div className={s.journeyChart}><span>PROFIT TARGET — 8%</span><svg viewBox="0 0 600 180" fill="none" role="img" aria-label="Sample equity rising toward an 8 percent profit target"><path d="M0 40H600" stroke="#9dc3e6" strokeDasharray="5 6" opacity=".5"/><path d="M0 165 45 150 90 155 135 132 180 138 225 105 270 116 315 80 360 90 405 60 450 72 500 35 550 42 600 22" stroke="#9DC3E6" strokeWidth="2.5"/></svg></div>
        <div className={s.phaseTrack}>{["Phase 1","Phase 2","Funded"].map((phase,i)=><span key={phase}><i>{i+1}</i>{phase}</span>)}</div><p className={s.visualNote}>Illustrative progress. Eligibility depends on program conditions and risk compliance.</p>
      </div>
    </div>
    <div className={s.instrumentBottom}><span>FUNDED HUB</span><span>SIMULATED ENVIRONMENT</span></div>
  </div>;
}

export function Journey(){
  const ref=useRef<HTMLElement>(null);
  const [active,setActive]=useState(0);
  const still=useStaticHero();
  useEffect(()=>{
    const items=ref.current?.querySelectorAll<HTMLElement>("[data-step]");
    if(!items || typeof IntersectionObserver === "undefined")return;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(Number((entry.target as HTMLElement).dataset.step));
    },{rootMargin:"-30% 0px -35% 0px",threshold:0});
    items.forEach(item=>observer.observe(item));return ()=>observer.disconnect();
  },[]);
  return <section ref={ref} className={`${s.section} ${s.journey}`} aria-labelledby="process-title">
    <div className={s.sectionHeading}><span className={s.eyebrow}>01 / HOW IT WORKS</span><SectionTitle id="process-title" first="Pick a program. Trade on Bybit." accent="Get paid."/></div>
    <div className={s.journeyGrid}>
      <div className={s.stickyVisual}><JourneyVisual active={active}/><div className={s.stepControls} role="group" aria-label="Preview process step">{steps.map((step,i)=><button key={step.title} type="button" aria-pressed={active===i} aria-label={`Preview step ${i+1}: ${step.title}`} onClick={()=>setActive(i)}>0{i+1}</button>)}</div></div>
      <div className={s.stepList}>{steps.map((step,i)=><article key={step.title} data-step={i} data-active={active===i} className={s.step}>
        <span className={s.stepNumber}>0{i+1}</span>{step.note && <span className={s.smallLabel}>{step.note}</span>}<h3>{step.title}</h3><Reveal><p>{step.text}</p></Reveal>
        <div className={s.stepRule}><motion.span initial={false} animate={{scaleX:active===i?1:0}} transition={{duration:still?0:.7,ease}}/></div>
      </article>)}</div>
    </div>
  </section>;
}

export function RiskMonitor(){
  const [day,setDay]=useState(opening.day);
  const rules=simulateDay(day);
  const state=rules.slice(1).reduce<"safe"|"warning"|"breach">((current,rule)=>{const next=severity(rule.value,rule.limit);return current==="breach"||next==="breach"?"breach":current==="warning"||next==="warning"?"warning":"safe";},"safe");
  const status=state==="breach"?"Rule breached":state==="warning"?"Approaching a risk limit":"Within limits";
  const path=chartPath(equityPoints(day));
  return <section className={`${s.section} ${s.riskSection}`} aria-labelledby="risk-title">
    <div className={s.riskHeading}><div><span className={s.eyebrow}>02 / THE RISK MONITOR</span><SectionTitle id="risk-title" first="See how close you are" accent="to every limit."/></div><div className={s.headingNote}><Reveal><p>Profit target, daily loss and max drawdown update as you trade. Daily limits are measured in UTC days.</p></Reveal></div></div>
    <Reveal focus={false}><div className={`${s.glass} ${s.riskPanel}`} data-severity={state}>
      <div className={s.grain} aria-hidden="true"/>
      <div className={s.instrumentTop}><h3>Risk Monitor<span> / USD</span></h3><span className={s.sampleBadge}>Sample account</span></div>
      <div className={s.equityHeader}><div><span className={s.smallLabel}>SIMULATED EQUITY</span><div className={s.equityValue}>$<NumberOnce value={100000*(1+rules[0].value/100)} decimals={2}/></div></div><div className={s.equityDelta}>{rules[0].value.toFixed(1)}%<span>PROFIT PROGRESS</span></div></div>
      <div className={s.chart}>
        <div className={s.chartLabels}><span>20%</span><span>10%</span><span>0%</span></div>
        <svg viewBox="0 0 800 220" preserveAspectRatio="none" fill="none" role="img" aria-label={`Sample equity curve ending at ${rules[0].value.toFixed(1)} percent profit progress`}>
          <defs><linearGradient id="risk-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="currentColor" stopOpacity=".18"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
          {[20,65,110,155,200].map(y=><path key={y} d={`M0 ${y}H800`} stroke="#ffffff" strokeOpacity=".07"/>)}
          <path d="M0 128H800" stroke="#9DC3E6" strokeDasharray="5 7" strokeOpacity=".65"/>
          <path d={`${path} L800 220 L0 220 Z`} fill="url(#risk-fill)"/>
          <path d={path} stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
        </svg><span className={s.targetLabel}>8% PROFIT TARGET</span>
      </div>
      <div className={s.sliderRow}><div><label htmlFor="cinematic-day-pnl">Simulate your day</label><span className={s.smallLabel}>DRAG TO EXPLORE THE LIMITS</span></div><output htmlFor="cinematic-day-pnl">{day>0?"+":""}{day.toFixed(1)}%</output></div>
      <input className={s.slider} id="cinematic-day-pnl" name="sample-day-pnl" type="range" min={-6} max={10} step={.1} value={day} onChange={event=>setDay(Number(event.target.value))} aria-valuetext={`${day.toFixed(1)} percent daily profit and loss`} aria-describedby="risk-sample-note"/>
      <div className={s.rangeEnds}><span>−6%</span><span>DAILY P&L</span><span>+10%</span></div>
      <div className={s.gauges}>{rules.map(rule=>{const color=rule.target?"safe":severity(rule.value,rule.limit);return <div key={rule.name} className={s.gauge} data-severity={color}>
        <h4>{rule.name}</h4><div className={s.gaugeValue}><NumberOnce value={rule.value} decimals={1}/><span>%</span></div>
        <div className={s.gaugeBar} role="meter" aria-label={rule.name} aria-valuemin={0} aria-valuemax={rule.limit} aria-valuenow={Math.min(rule.value,rule.limit)} aria-valuetext={`${rule.value.toFixed(1)}% of ${rule.limit}% ${rule.target?"target":"limit"}${color==="breach"?", breached":""}`}><span style={{transform:`scaleX(${Math.min(rule.value/rule.limit,1)})`}}/></div>
        <span className={s.smallLabel}>{rule.target?"TARGET":"LIMIT"} {rule.limit.toFixed(1)}%</span>
      </div>;})}</div>
      <div className={s.statusLine}><span role="status" aria-live="polite" aria-atomic="true"><i aria-hidden="true"/>{status}</span><span className={s.smallLabel}>SAMPLE / NOT LIVE RISK DATA</span></div>
      <p id="risk-sample-note" className={s.panelNote}>Sample opens at 7.6% profit progress and 4.4% drawdown. Move today’s P&L to see the effect. Illustrative values; actual rules depend on your program.</p>
    </div></Reveal>
  </section>;
}

const desktopQuery="(min-width: 900px) and (pointer: fine)";
function subscribeDesktop(change:()=>void){const q=matchMedia(desktopQuery);q.addEventListener("change",change);return ()=>q.removeEventListener("change",change);}
function ProgramCard({index}: {index:number}){
  const program=programs[index];
  const desktop=useSyncExternalStore(subscribeDesktop,()=>matchMedia(desktopQuery).matches,()=>false);
  const still=useStaticHero();
  return <div className={s.programSlot}><Reveal className={s.programReveal} focus={false}><button type="button" className={`${s.glass} ${s.programCard}`} onPointerMove={event=>{
    if(!desktop||still)return;
    const bounds=event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x",`${event.clientX-bounds.left}px`);event.currentTarget.style.setProperty("--pointer-y",`${event.clientY-bounds.top}px`);
  }} onClick={()=>document.querySelector<HTMLButtonElement>('button[data-program-info]')?.click()} aria-label={`View ${program.name} reference program information`}>
    <span className={s.cardSpotlight} aria-hidden="true"/>
    <span className={s.programTop}><span>Program</span><Arrow/></span>
    <h3>{program.name}</h3><p>{program.note}</p>
    <Sparkline values={program.line} id={`program-chart-${index}`}/>
    <div className={s.phaseTrack}>{program.phases.map((phase,i)=><span key={phase}><i>{i+1}</i>{phase}</span>)}</div>
    <span className={s.referenceLabel}>Reference figures</span>
    <div className={s.programStats}><div><strong>$5K to $200K</strong><span>SIMULATED CAPITAL</span></div><div><strong>{program.share}</strong><span>REWARD SHARE</span></div></div>
    <span className={s.programLink}>View program <Arrow/></span>
  </button></Reveal></div>;
}

export function Programs(){
  return <section className={`${s.section} ${s.programSection}`} aria-labelledby="programs-title">
    <div className={s.sectionHeading}><span className={s.eyebrow}>03 / YOUR STARTING POINT</span><SectionTitle id="programs-title" first="Choose how" accent="you start."/></div>
    <div className={s.programGrid}>{programs.map((p,i)=><ProgramCard key={p.name} index={i}/>)}</div>
    <div className={s.programDisclaimer}><p>Read the targets, loss limits and payout policy for your chosen program before you pay.</p></div>
  </section>;
}

export function Payouts(){
  return <section className={`${s.section} ${s.payoutSection}`} aria-labelledby="payout-title">
    <div><span className={s.eyebrow}>04 / PAYOUT ILLUSTRATION</span><SectionTitle id="payout-title" first="Payouts are real." accent="Review comes first."/><div className={s.payoutCopy}><Reveal><p>Challenge fees and performance rewards are separate. When you qualify, request a reward in USDT, USDC or BTC. The firm reviews and pays it under the payout policy.</p></Reveal></div></div>
    <Reveal className={s.payoutCardWrap} focus={false}><div className={`${s.glass} ${s.payoutCard}`}>
      <div className={s.instrumentTop}><span className={s.eyebrow}>REWARD STATEMENT</span><span className={s.sampleBadge}>Sample</span></div>
      <span className={s.smallLabel}>SAMPLE PAYOUT</span><div className={s.payoutAmount}>$<NumberOnce value={640} decimals={2}/><span>USD</span></div>
      <div className={s.splitRow}><span>$800.00 eligible profit</span><span>80% split</span></div>
      <div className={s.currencyRow}>{["USDT","USDC","BTC"].map((coin,i)=><span key={coin}><i aria-hidden="true">{["₮","$","₿"][i]}</i>{coin}</span>)}</div>
      <div className={s.payoutTrack}>{["Requested","Reviewed","Paid"].map((label,i)=><span key={label}><b aria-hidden="true">{i===2?"✓":`0${i+1}`}</b>{label}</span>)}</div>
      <p className={s.panelNote}>Not a real payment. This is an illustration of the intended reward process, not proof of a payout.</p>
    </div></Reveal>
  </section>;
}

export function Closing(){
  return <section className={s.closing} aria-labelledby="closing-title">
    <div className={s.closingContent}><SectionTitle id="closing-title" first="Start your" accent="first challenge." signature/>
      <button className={s.primaryCta} type="button" onClick={()=>document.querySelector<HTMLButtonElement>('button[data-program-info]')?.click()}>Choose a program <Arrow/></button>
    </div>
    <footer className={`${s.glass} ${s.footer}`}>
      <div className={s.footerTop}><a href="#hero-title" className={s.wordmark}>Funded HUB</a><span className={s.eyebrow}>CRYPTO ONLY. ALWAYS IN PERSPECTIVE.</span><a href="#hero-title">Back to top ↑</a></div>
      <p>All trading uses simulated capital on Bybit Demo. Real profit-share payouts depend on eligibility, risk compliance and program terms. Simulated results do not guarantee future performance. Trading involves risk.</p>
      <div className={s.footerBottom}><span>© 2026 FUNDED HUB</span><span>SIMULATED CAPITAL / CRYPTO ONLY</span></div>
    </footer>
  </section>;
}
