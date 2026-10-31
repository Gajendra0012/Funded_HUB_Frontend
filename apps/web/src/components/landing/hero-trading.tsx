"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useStaticHero } from "./use-static-hero";
import { candleSeries, priceFormat, samplePriceSource, type SampleQuote } from "./sample-price-source";
import { heroMarketSource, marketSnapshot, marketSymbols, type MarketSource, type MarketUpdate } from "./hero-market-source";
import s from "./hero-trading.module.css";

type HeroMarketStore = {frame:MarketUpdate;quotes:readonly SampleQuote[];label:string;active:boolean;paused:boolean;toggle:()=>void};
const initialFrame:MarketUpdate = {tickers:marketSnapshot,live:false};
const initialQuotes = marketSnapshot.map(q=>({symbol:q.symbol,price:q.last,change:q.change24h}));
const TradingContext = createContext<HeroMarketStore>({frame:initialFrame,quotes:initialQuotes,label:"Sample prices",active:false,paused:true,toggle:()=>{}});
const candles = candleSeries();

export function useHeroMarketStore() { return useContext(TradingContext); }

export function SampleTradingProvider({ children, source = heroMarketSource }: { children: ReactNode; source?: MarketSource }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStaticHero();
  const [paused,setPaused] = useState(false), [active,setActive] = useState(false), [flowing,setFlowing] = useState(false);
  const [frame,setFrame] = useState<MarketUpdate>(initialFrame);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    let visible = false, stop:(()=>void)|undefined;
    const sync = () => {
      stop?.();stop=undefined;
      const run = visible && !document.hidden && !paused && !still;
      setActive(run);setFlowing(false);
      if (run) stop=source.subscribe(marketSymbols,update=>{setFrame(update);setFlowing(update.live);});
    };
    const observer = new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
    observer.observe(ref.current.querySelector("section") ?? ref.current);
    document.addEventListener("visibilitychange",sync);
    return ()=>{observer.disconnect();stop?.();document.removeEventListener("visibilitychange",sync);};
  },[paused,still,source]);
  const quotes = frame.tickers.map(q=>({symbol:q.symbol,price:q.last,change:q.change24h}));
  const label = frame.live ? flowing && active ? "Live, Bybit" : active ? "Bybit, connecting" : "Bybit, paused" : "Sample prices";
  return <TradingContext.Provider value={{frame,quotes,label,active,paused:paused||still,toggle:()=>setPaused(p=>!p)}}><div ref={ref}>{children}</div></TradingContext.Provider>;
}

export function SampleTicker() {
  const { quotes, paused, toggle, label } = useContext(TradingContext);
  const still = useStaticHero();
  return <div className={s.ticker} aria-label="Sample crypto prices">
    <div className={s.tickerLabel}><span role="status" aria-live="polite">{label}</span><small>24H CHANGE</small></div>
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
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const ref = useRef<HTMLDivElement>(null);
  const still = useStaticHero();
  const { quotes, paused, toggle, label } = useContext(TradingContext);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.25"] });
  const rotateX = useTransform(scrollYProgress, [0,1], still ? [0,0] : [8,0]);
  const y = useTransform(scrollYProgress, [0,1], still ? [0,0] : [36,0]);
  return <div ref={ref} className={s.dashboardStage}>
    <motion.div className={s.floatingWindow} style={{ rotateX, y }}>
      <div className={s.laptopLid}>
        <div className={s.camera} aria-hidden="true"><span/></div>
        <div ref={screen} className={s.laptopScreen}>
        <div className={s.dashboard} data-hero-market-window>
      <header><span className={s.dashboardBrand}>Funded HUB <small>/ TRADER OVERVIEW</small></span><div><span className={s.sample}>Sample account</span>{!still && <button type="button" aria-pressed={paused} onClick={toggle}>{paused ? "Resume prices" : "Pause prices"}</button>}</div></header>
      <div className={s.dashboardBody}>
        <aside><span className={s.label}>2-STEP / $100K</span><dl><div><dt>Balance</dt><dd>$100,000.00</dd></div><div><dt>Equity</dt><dd>$106,400.00</dd></div><div><dt>Daily P&L</dt><dd>−1.20%</dd></div></dl><span className={s.accountStatus}>Within limits</span></aside>
        <div className={s.chartPanel}><div className={s.chartTop}><div><strong>BTCUSDT</strong><span>Bybit Demo / {label}</span></div><div><b>{priceFormat.format(quotes[0].price)}</b><span className={s.quoteChange} data-positive={quotes[0].change >= 0}>{quotes[0].change >= 0 ? "+" : ""}{quotes[0].change.toFixed(2)}%</span></div></div><CandleChart price={quotes[0].price}/><div className={s.timeLabels}><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span></div></div>
      </div>
      <footer><span>Sample account · simulated capital</span><span>Seeded chart · no account linked</span></footer>
        </div>
        </div>
        <div className={s.laptopChin} aria-hidden="true">MacBook Pro</div>
      </div>
      <div className={s.laptopBase} aria-hidden="true"><span/></div>
    </motion.div>
    <SampleTicker/>
    <div className={s.mobileControls}><span>Sample account</span>{!still && <button type="button" aria-pressed={paused} onClick={toggle}>{paused ? "Resume prices" : "Pause prices"}</button>}</div>
  </div>;
}
