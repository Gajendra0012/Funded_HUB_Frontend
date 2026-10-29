"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, MotionConfig, useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useMotionPreference } from "./use-motion-preference";
import { HeroArt } from "./hero-art";
import { programs, riskState, sampleOpening, simulateDay, timing } from "./landing-data";
import styles from "./landing.module.css";

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useMotionPreference();
  return <motion.div className={className} initial={false} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.15 }} style={{ y: reduced ? 0 : 12 }}>{children}</motion.div>;
}

function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  const [initial] = useState(value);
  const visible = useInView(ref, { once: true });
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      current.current = value;
      if (ref.current) ref.current.textContent = value.toFixed(1);
      return;
    }
    // Start from the displayed value so fast slider input interrupts smoothly instead of resetting to zero.
    const controls = animate(current.current, value, { duration: timing.duration.short, ease: timing.ease, onUpdate: latest => {
      current.current = latest;
      if (ref.current) ref.current.textContent = latest.toFixed(1);
    } });
    return () => controls.stop();
  }, [value, visible, reduced]);
  return <span ref={ref}>{initial.toFixed(1)}</span>;
}

const steps = [
  { number: "01", title: "Choose a starting point.", text: "Pick a challenge with simulated capital. Read the targets and loss limits before you begin.", note: "YOUR PROGRAM / YOUR PACE" },
  { number: "02", title: "Trade inside the lines.", text: "Execute your crypto trades on Bybit Demo. Funded HUB keeps your challenge progress and risk limits in view.", note: "CRYPTO ONLY / BYBIT DEMO" },
  { number: "03", title: "Make discipline count.", text: "Meet your program’s conditions and complete the required review to qualify for real profit-share payouts.", note: "SIMULATED CAPITAL / REAL PAYOUTS" },
];

function Journey() {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", value => setActive(Math.min(2, Math.floor(value * 3))));
  return <section className={`${styles.section} ${styles.journey}`} id="process" aria-labelledby="process-title">
    <div className={styles.journeyHeading}><div><span className={styles.kicker}>01 / HOW IT WORKS</span><h2 id="process-title">A deliberate<br /><em>way forward.</em></h2></div><p className={styles.lead}>Three steps. One constant:<br />respect for risk.</p></div>
    <div className={styles.journeyGrid}>
      <div className={styles.journeyNumeral} aria-hidden="true"><span className={styles.giantNumber}>{steps[active].number}</span><span className={styles.micro}>THE PROCESS</span><div className={styles.stepDots}>{steps.map((step,index)=><span key={step.number} data-active={active===index} />)}</div></div>
      <ol ref={ref} className={styles.steps}>{steps.map((step,index)=><li className={styles.step} key={step.number} data-active={active===index}>
        <span className={styles.stepNumber}>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p><span className={styles.micro}>{step.note}</span>
      </li>)}</ol>
    </div>
  </section>;
}

function RiskGauge() {
  const [pnl, setPnl] = useState(sampleOpening.day);
  const reduced = useMotionPreference();
  const rules = simulateDay(pnl);
  const dailyState = riskState(rules[1].value, rules[1].limit);
  const drawdownState = riskState(rules[2].value, rules[2].limit);
  const state = dailyState === "breach" || drawdownState === "breach" ? "breach" : dailyState === "warning" || drawdownState === "warning" ? "warning" : "safe";
  const status = state === "breach" ? "Rule breached" : state === "warning" ? dailyState === "warning" ? "Close to daily limit" : "Close to drawdown limit" : "Within limits";
  const signed = `${pnl > 0 ? "+" : ""}${pnl.toFixed(1)}%`;
  return <div className={styles.gauge}>
    <div className={styles.gaugeHeader}><h3>Risk Monitor<span aria-hidden="true"> /</span></h3><span className={styles.sample}>Sample account</span></div>
    <div className={styles.simulator}>
      <div className={styles.simulatorHeading}><label htmlFor="day-pnl">Simulate your day</label><output htmlFor="day-pnl" className={styles.dayValue}>{signed}</output></div>
      <input id="day-pnl" type="range" min={-6} max={10} step={0.1} value={pnl} onChange={event=>setPnl(Number(event.target.value))} aria-valuetext={`${signed} daily profit and loss`} aria-describedby="simulation-note" />
      <div className={styles.rangeLabels} aria-hidden="true"><span>−6%</span><span>DAILY P&L</span><span>+10%</span></div>
    </div>
    <div className={styles.ruleGrid}>{rules.map(rule => {
      // A profit target is an objective, never a loss breach. Over-limit text stays truthful while the visual bar caps at 100%.
      const severity = rule.kind === "target" ? "safe" : riskState(rule.value,rule.limit);
      return <div className={styles.rule} key={rule.name} data-severity={severity}>
        <h4>{rule.name}</h4><div className={styles.ruleValue}><span aria-hidden="true"><Count value={rule.value} />%</span><span className={styles.visuallyHidden}>{rule.value.toFixed(1)}%</span><small> / {rule.limit}%</small></div>
        <div className={styles.bar} role="meter" aria-label={`${rule.name}: ${rule.detail}`} aria-valuemin={0} aria-valuemax={rule.limit} aria-valuenow={Math.min(rule.value,rule.limit)} aria-valuetext={`${rule.value.toFixed(1)}% of ${rule.limit}% ${rule.kind === "target" ? "target" : "limit"}${severity === "breach" ? "; breached" : ""}`}>
          <motion.div initial={false} animate={{scaleX:Math.min(rule.value/rule.limit,1)}} transition={{duration:reduced?0:timing.duration.short}} /><span className={styles.limitMark} />
        </div><span className={styles.micro}>{rule.kind === "target" ? "TARGET" : "LIMIT"} {rule.limit.toFixed(1)}%</span>
      </div>;
    })}</div>
    <div className={styles.status} data-severity={state} role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true" />{status}</div>
    <p id="simulation-note" className={styles.gaugeNote}>Sample opens at <span className={styles.numeric}>7.6%</span> profit progress and <span className={styles.numeric}>4.4%</span> drawdown. Move today’s P&L to see the effect. Illustrative values; actual rules depend on your program.</p>
  </div>;
}

export function Landing() {
  const reduced = useMotionPreference();
  return <MotionConfig transition={{ duration: timing.duration.base, ease: timing.ease }} reducedMotion={reduced ? "always" : "never"}>
    <div className={styles.masthead}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>Funded<span>HUB</span><i aria-hidden="true" /></Link>
        <nav aria-label="Main navigation"><a href="#process">Process</a><a href="#risk">Rules</a><a href="#programs">Programs <span aria-hidden="true">↗</span></a></nav>
      </header>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroMeta}><span className={styles.micro}>CRYPTO PROP TRADING</span><span className={styles.micro}>DISCIPLINE HAS AN UPSIDE.</span></div>
        <div className={styles.heroLayout}><div className={styles.heroCopy}><h1 id="hero-title">Less noise.<br /><em>More nerve.</em></h1><p className={styles.lead}>Take a challenge on simulated capital. Trade crypto on Bybit Demo. Respect the risk rules and earn real profit-share payouts.</p><a href="/programs" className={styles.cta}>Find your program <span aria-hidden="true">↗</span></a></div><HeroArt /></div>
        <div className={styles.heroBottom}><span className={styles.micro}>SIMULATED CAPITAL. MEASURABLE DISCIPLINE.</span><span className={styles.micro}>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></div>
      </section>
    </div>
    <Journey />
    <section className={`${styles.section} ${styles.risk}`} id="risk" aria-labelledby="risk-title">
      <Reveal className={styles.riskIntro}><span className={styles.kicker}>02 / THE OPERATING LIMITS</span><div><h2 id="risk-title">Know exactly<br /><em>where you stand.</em></h2><p className={styles.lead}>A target to reach.<br />Boundaries to respect.<br />Keep all three in sight.</p></div></Reveal><RiskGauge />
    </section>
    <section className={`${styles.section} ${styles.programs}`} id="programs" aria-labelledby="programs-title">
      <Reveal className={styles.programHeading}><div><span className={styles.kicker}>03 / PROGRAMS</span><h2 id="programs-title">Your next <em>move.</em></h2></div><p className={styles.lead}>Choose the structure.<br />Bring your own strategy.</p></Reveal>
      <div className={styles.programGrid}>{programs.map((program,index)=><a className={styles.programCard} href="/programs" key={program.name}>
        <span className={styles.programIndex}>0{index+1}<span className={styles.cardArrow} aria-hidden="true">↗</span></span><h3>{program.name}</h3><span className={styles.micro}>{program.label}</span><p>{program.text}</p>
        <div className={styles.referenceFigures}><span className={styles.micro}>REFERENCE FIGURES</span><div><strong>{program.capital}</strong><span className={styles.micro}>SIMULATED CAPITAL</span></div><div><strong>{program.share}</strong><span className={styles.micro}>REWARD SHARE</span></div></div><span className={styles.programLink}>View program <span aria-hidden="true">↗</span></span>
      </a>)}</div>
    </section>
    <section className={styles.closing} aria-labelledby="closing-title">
      <Reveal className={styles.closingInner}><div><span className={styles.kicker}>MAKE YOUR NEXT MOVE A CONSIDERED ONE.</span><h2 id="closing-title">Bring your<br /><em>discipline.</em></h2></div><a href="/programs" className={styles.cta}>Explore programs <span aria-hidden="true">↗</span></a></Reveal>
      <footer className={styles.footer}><div className={styles.footerTop}><Link href="/" className={styles.wordmark}>Funded<span>HUB</span><i aria-hidden="true" /></Link><span className={styles.micro}>CRYPTO ONLY. ALWAYS IN PERSPECTIVE.</span><a href="#hero-title">Back to top ↑</a></div><div className={styles.footerBottom}><p>All trading uses simulated capital on Bybit Demo. Real profit-share payouts depend on eligibility, risk compliance and program terms. Simulated results do not guarantee future performance. Trading involves risk.</p><span className={styles.micro}>© <span className={styles.numeric}>2026</span> FUNDED HUB</span></div></footer>
    </section>
  </MotionConfig>;
}
