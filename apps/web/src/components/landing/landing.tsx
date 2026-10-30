"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useStaticHero } from "./use-static-hero";
import { globeAssets, startGlobePlayback } from "./video-playback";
import styles from "./landing.module.css";

const panels = {
  programs: {
    label: "Programs", title: "Find your starting point.",
    paragraphs: ["Crypto trading challenges built around simulated capital on Bybit Demo.", "Choose your account size and evaluation path. Know your targets and loss limits before your first trade. Reward eligibility follows the program terms."],
  },
  process: {
    label: "How it works", title: "Make discipline your edge.",
    paragraphs: ["Choose a challenge and understand its objectives and risk limits. Execute your crypto trades on Bybit Demo while Funded HUB tracks your progress.", "Meet your program’s conditions and complete the required review to become eligible for profit-share rewards under the applicable terms. Simulated results do not guarantee future performance."],
  },
  platform: {
    label: "Platform", title: "Crypto. On familiar ground.",
    paragraphs: ["Execute your trades and read your charts on Bybit Demo. Follow your challenge progress and risk limits in Funded HUB.", "A crypto-first environment with simulated capital and clear objectives."],
  },
  faq: {
    label: "FAQ", title: "A little clarity.",
    paragraphs: ["Is this live trading? No. Challenge accounts are designed to use simulated capital on Bybit Demo.", "How do rewards work? Eligibility follows your program conditions, risk compliance, and review.", "Are rewards guaranteed? No. Eligibility depends on program conditions, risk compliance, and review."],
  },
  support: {
    label: "Support", title: "Here for your next step.",
    paragraphs: ["Keep your program rules, trading progress, and account questions in focus.", "Explore how the challenge journey works, or compare evaluation paths before your next step."],
  },
  login: {
    label: "Trader access", title: "Your trading chapter starts here.",
    paragraphs: ["Your account, your objectives, your next move.", "Your challenge progress, risk limits, and reward eligibility. One clear view."],
  },
} as const;

type Panel = keyof typeof panels;
const navigation: Panel[] = ["programs", "process", "platform", "faq", "support"];

function Arrow() {
  return <svg className={styles.arw} viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Landing({ className = "", background, tradingLayer, hasTradingDashboard = false, paused = false }: { className?: string; background?: ReactNode; tradingLayer?: ReactNode; hasTradingDashboard?: boolean; paused?: boolean }) {
  const hero = useRef<HTMLElement>(null);
  const firstVideo = useRef<HTMLVideoElement>(null);
  const secondVideo = useRef<HTMLVideoElement>(null);
  const lastCta = useRef<HTMLButtonElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const staticHero = useStaticHero();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("programs");
  const returnToBurger = useRef(false);

  useLayoutEffect(() => {
    const element = hero.current;
    const finalButton = lastCta.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let started = false;
    let disposed = false;
    let safety: ReturnType<typeof setTimeout>;
    element.dataset.entrance = "waiting";
    function clean() { delete element!.dataset.entrance; }
    function start() {
      if (started || disposed) return;
      started = true;
      clearTimeout(ceiling);
      element!.dataset.entrance = "running";
      safety = setTimeout(clean, 2600);
    }
    const ceiling = setTimeout(start, 900);
    void document.fonts.ready.then(start, start);
    finalButton?.addEventListener("animationend", clean);
    return () => {
      disposed = true;
      clearTimeout(ceiling);
      clearTimeout(safety);
      finalButton?.removeEventListener("animationend", clean);
      clean();
    };
  }, []);

  useEffect(() => {
    if (background !== undefined) return;
    firstVideo.current?.load();
    secondVideo.current?.load();
  }, [staticHero, background]);

  useEffect(() => {
    if (background !== undefined) return;
    const first = firstVideo.current, second = secondVideo.current;
    if (!first || !second) return;
    if (staticHero || paused) {
      first.pause(); second.pause();
      if (staticHero) {
        first.dataset.active = "true";
        second.dataset.active = "false";
        try { first.currentTime = 0; } catch { /* The poster remains visible before metadata loads. */ }
      }
      return;
    }
    return startGlobePlayback(first, second);
  }, [staticHero, paused, background]);

  useEffect(() => {
    if (!menuOpen) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && !burger.current?.contains(event.target)) setMenuOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setMenuOpen(false); burger.current?.focus(); }
    }
    const desktop = window.matchMedia("(min-width: 1161px)");
    function resize() { if (desktop.matches) setMenuOpen(false); }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, [menuOpen]);

  function navigate(next: Panel) {
    const id = next === "process" ? "how-it-works" : next === "programs" ? "programs" : null;
    const section = id && document.getElementById(id);
    if (section) { setMenuOpen(false); section.scrollIntoView({ behavior: staticHero ? "instant" : "smooth", block: "start" }); return; }
    openPanel(next);
  }

  function openPanel(next: Panel) {
    returnToBurger.current = menuOpen;
    setPanel(next);
    setMenuOpen(false);
    dialog.current?.showModal();
  }

  return <section ref={hero} className={`${styles.hero} ${className}`} data-trading={hasTradingDashboard || Boolean(tradingLayer)} aria-labelledby="hero-title">
    {background !== undefined ? background : <div className={styles.bg} role="img" aria-label="A blue illuminated Earth with connected network points against a starfield">
      <video ref={firstVideo} className={styles["bg-video"]} data-active="true" muted loop playsInline preload={staticHero ? "none" : "auto"} disablePictureInPicture aria-hidden="true" poster={globeAssets.poster}>
        {!staticHero && <source src={globeAssets.video} type="video/mp4" />}
      </video>
      <video ref={secondVideo} className={styles["bg-video"]} data-active="false" muted loop playsInline preload={staticHero ? "none" : "auto"} disablePictureInPicture aria-hidden="true" poster={globeAssets.poster}>
        {!staticHero && <source src={globeAssets.video} type="video/mp4" />}
      </video>
    </div>}
    <header className={styles.nav}>
      <Link className={styles.logo} href="/" aria-label="Funded HUB home">Funded HUB</Link>
      <nav className={styles["nav-links"]} aria-label="Primary">{navigation.map(key => background !== undefined && (key === "programs" || key === "process") ? <a key={key} href={key === "process" ? "#how-it-works" : "#programs"} onClick={() => setMenuOpen(false)}>{panels[key].label}</a> : <button key={key} type="button" onClick={() => navigate(key)} aria-haspopup="dialog">{panels[key].label}</button>)}</nav>
      <div className={styles["nav-actions"]}>
        <button className={`${styles.btn} ${styles["btn-login"]}`} type="button" onClick={() => openPanel("login")} aria-haspopup="dialog">Login</button>
        <button className={`${styles.btn} ${styles["btn-nav-start"]}`} type="button" data-program-info onClick={() => openPanel("programs")} aria-haspopup="dialog">Get Started <Arrow /></button>
      </div>
      <button ref={burger} className={styles.burger} type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="landing-menu" onClick={() => setMenuOpen(!menuOpen)}><span /></button>
    </header>
    <nav ref={menu} className={`${styles.menu} ${menuOpen ? styles.open : ""}`} id="landing-menu" aria-label="Mobile">
      {navigation.map(key => background !== undefined && (key === "programs" || key === "process") ? <a key={key} href={key === "process" ? "#how-it-works" : "#programs"} onClick={() => setMenuOpen(false)}>{panels[key].label}</a> : <button key={key} type="button" onClick={() => navigate(key)} aria-haspopup="dialog">{panels[key].label}</button>)}
      <div className={styles.divider} />
      <button type="button" onClick={() => openPanel("login")} aria-haspopup="dialog">Login</button>
      <button className={styles["m-start"]} type="button" data-program-info onClick={() => openPanel("programs")} aria-haspopup="dialog">Get Started <Arrow /></button>
    </nav>
    <div className={styles["hero-inner"]}>
      <h1 id="hero-title" className={styles.heading}><span className={styles.ln}><span className={styles["ln-i"]}>Your edge.</span></span><span className={styles.ln}><span className={styles["ln-i"]}>Amplified.</span></span></h1>
      <p className={styles.sub}>Choose your challenge. Trade crypto on Bybit Demo.<br /> Keep your progress and risk limits in view,<br /> and build your next chapter as a trader.</p>
      <div className={styles.ctas}>
        <button className={`${styles.btn} ${styles["btn-lg"]} ${styles["btn-primary"]}`} type="button" data-program-info onClick={() => openPanel("programs")} aria-haspopup="dialog">Get Started <Arrow /></button>
        <button ref={lastCta} className={`${styles.btn} ${styles["btn-lg"]} ${styles["btn-ghost"]}`} type="button" onClick={() => openPanel("process")} aria-haspopup="dialog">How it works <Arrow /></button>
      </div>
    </div>
    {tradingLayer}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="landing-dialog-title" onClose={() => { if (returnToBurger.current) burger.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button type="button" className={styles["dialog-close"]} aria-label="Close dialog" onClick={() => dialog.current?.close()}><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
      <span className={styles.eyebrow}>Funded HUB / {panels[panel].label}</span>
      <h2 id="landing-dialog-title">{panels[panel].title}</h2>
      {panels[panel].paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <p className={styles["dialog-note"]}>Simulated capital. Preview only. No live accounts, purchases, or payouts are connected.</p>
    </dialog>
  </section>;
}
