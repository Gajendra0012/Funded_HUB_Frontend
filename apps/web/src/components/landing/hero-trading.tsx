"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useStaticHero } from "./use-static-hero";
import { candleSeries, priceFormat, samplePriceSource, type PriceSource, type SampleQuote } from "./sample-price-source";
import s from "./hero-trading.module.css";

const TradingContext = createContext<{ quotes: readonly SampleQuote[]; paused: boolean; toggle: () => void }>({ quotes: samplePriceSource.snapshot, paused: false, toggle: () => {} });
const candles = candleSeries();

export function SampleTradingProvider({ children, source = samplePriceSource }: { children: ReactNode; source?: PriceSource }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const still = useStaticHero();
  const [paused, setPaused] = useState(false);
  const [quotes, setQuotes] = useState(source.snapshot);
  useEffect(() => {
    if (!visible || still || paused) return;
    let unsubscribe: (() => void) | undefined;
    function sync() {
      unsubscribe?.(); unsubscribe = undefined;
      if (!document.hidden) unsubscribe = source.subscribe(setQuotes);
    }
    sync(); document.addEventListener("visibilitychange", sync);
    return () => { unsubscribe?.(); document.removeEventListener("visibilitychange", sync); };
  }, [visible, still, paused, source]);
  return <TradingContext.Provider value={{ quotes, paused: paused || still, toggle: () => setPaused(!paused) }}><div ref={ref}>{children}</div></TradingContext.Provider>;
}

export function SampleTicker() {
  const { quotes, paused, toggle } = useContext(TradingContext);
  const still = useStaticHero();
  return <div className={s.ticker} aria-label="Sample crypto prices">
    <div className={s.tickerLabel}><span>Sample prices</span><small>24H CHANGE</small></div>
    <ul tabIndex={0} aria-label="Sample market quotes; scroll horizontally for more">{quotes.map(quote => <li key={quote.symbol}><span>{quote.symbol}</span><strong>{priceFormat.format(quote.price)}</strong><em data-positive={quote.change >= 0}>{quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)}%</em></li>)}</ul>
    {!still && <button type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Resume sample prices" : "Pause sample prices"}>{paused ? "Resume" : "Pause"}</button>}
  </div>;
}

function CandleChart({ price }: { price: number }) {
  const low = Math.min(...candles.map(c => c.low)) - 50;
  const high = Math.max(...candles.map(c => c.high)) + 50;
  const y = (value: number) => 200 - (value - low) / (high - low) * 180;
  const drift = (price - samplePriceSource.snapshot[0].price) * .5;
  return <svg className={s.candles} viewBox="0 0 760 240" fill="none" role="img" aria-label="Seeded sample BTCUSDT candlestick chart, not historical performance">
    {[30,80,130,180,230].map(line => <path key={line} d={`M0 ${line}H760`} stroke="#ffffff" strokeOpacity=".07" />)}
    {candles.map((candle, index) => {
      const close = candle.close + (index === candles.length - 1 ? drift : 0);
      const color = close >= candle.open ? "#8ce7bb" : "#ffb4b4";
      const x = index * 15.5 + 10;
      return <g key={index}><path d={`M${x} ${y(Math.max(candle.high, close))}V${y(Math.min(candle.low, close))}`} stroke={color}/><rect x={x-4} y={Math.min(y(candle.open),y(close))} width="8" height={Math.max(2,Math.abs(y(candle.open)-y(close)))} fill={color} rx="1"/></g>;
    })}
  </svg>;
}

export function TradingDashboard() {
  const screen = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    const resize = () => element.style.setProperty("--screen-scale", String(element.clientWidth / 1200));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const ref = useRef<HTMLDivElement>(null);
  const still = useStaticHero();
  const { quotes, paused, toggle } = useContext(TradingContext);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.25"] });
  const rotateX = useTransform(scrollYProgress, [0,1], still ? [0,0] : [12,0]);
  const y = useTransform(scrollYProgress, [0,1], still ? [0,0] : [36,0]);
  return <div ref={ref} className={s.dashboardStage}>
    <motion.div className={s.laptop} style={{ rotateX, y }}>
      <div className={s.laptopLid}>
        <div className={s.camera} aria-hidden="true"><span/></div>
        <div ref={screen} className={s.laptopScreen}>
        <div className={s.dashboard}>
      <header><span className={s.dashboardBrand}>Funded HUB <small>/ TRADER OVERVIEW</small></span><div><span className={s.sample}>Sample account</span>{!still && <button type="button" aria-pressed={paused} onClick={toggle}>{paused ? "Resume prices" : "Pause prices"}</button>}</div></header>
      <div className={s.dashboardBody}>
        <aside><span className={s.label}>2-STEP / $100K</span><h2>Your account.<br/><em>In focus.</em></h2><dl><div><dt>Balance</dt><dd>$100,000.00</dd></div><div><dt>Equity</dt><dd>$106,400.00</dd></div><div><dt>Daily P&L</dt><dd>−1.20%</dd></div></dl><span className={s.accountStatus}>Within limits</span></aside>
        <div className={s.chartPanel}><div className={s.chartTop}><div><strong>BTCUSDT</strong><span>Bybit Demo / Sample prices</span></div><div><b>{priceFormat.format(quotes[0].price)}</b><span className={s.quoteChange} data-positive={quotes[0].change >= 0}>{quotes[0].change >= 0 ? "+" : ""}{quotes[0].change.toFixed(2)}%</span></div></div><CandleChart price={quotes[0].price}/><div className={s.timeLabels}><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span></div></div>
      </div>
      <footer><span>Sample account · simulated capital</span><span>Seeded data · no live connection</span></footer>
        </div>
        </div>
        <div className={s.laptopChin} aria-hidden="true">MacBook Pro</div>
      </div>
      <div className={s.laptopBase} aria-hidden="true"><span/></div>
    </motion.div>
    <div className={s.mobileControls}><span>Sample account</span>{!still && <button type="button" aria-pressed={paused} onClick={toggle}>{paused ? "Resume prices" : "Pause prices"}</button>}</div>
  </div>;
}
