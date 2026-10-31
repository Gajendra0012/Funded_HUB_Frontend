"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { type MarketTicker } from "./hero-market-source";
import { priceFormat } from "./sample-price-source";
import { useHeroMarketStore } from "./hero-trading";
import { useStaticHero } from "./use-static-hero";
import s from "./hero-data-rails.module.css";

const volumeFormat = new Intl.NumberFormat("en-US", {notation: "compact", maximumFractionDigits: 2});
function Price({value, animate}: {value:number;animate:boolean}) {
  const ref = useRef<HTMLSpanElement>(null), previous = useRef(value);
  useEffect(() => {
    const old = previous.current; previous.current = value;
    if (!animate || old === value || !ref.current?.animate) return;
    const effect = ref.current.animate([{color:value > old ? "#8ce7bb" : "#ffb4b4"},{color:"#e2ebf5"}], {duration:200});
    return () => effect.cancel();
  }, [value, animate]);
  return <span ref={ref} className={s.price}>{priceFormat.format(value)}</span>;
}
function Sparkline({ticker}: {ticker:MarketTicker}) {
  const min = Math.min(...ticker.history), max = Math.max(...ticker.history), range = max - min || 1;
  const path = ticker.history.map((v,i) => (i ? "L" : "M") + (i / Math.max(1,ticker.history.length - 1) * 180).toFixed(1) + "," + (36 - (v-min)/range*30).toFixed(1)).join(" ");
  return <svg viewBox="0 0 180 40" fill="none" className={s.spark} data-positive={ticker.change24h >= 0}><defs><linearGradient id={`rail-area-${ticker.symbol}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="currentColor" stopOpacity=".15"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path d={`${path} L180 40 L0 40 Z`} fill={`url(#rail-area-${ticker.symbol})`}/><path d={path} stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/></svg>;
}
export function HeroDataRails() {
  const ref = useRef<HTMLDivElement>(null);
  const {frame,active,label} = useHeroMarketStore();
  const still = useStaticHero();
  const {scrollYProgress} = useScroll({target:ref,offset:["start start","end start"]});
  const y = useTransform(scrollYProgress,[0,1],still ? [0,0] : [0,120]);
  return <div ref={ref} className={s.layer} data-hero-rails>
    <span className={s.feedLabel} role="status" aria-live="polite">{label}</span>
    <motion.aside aria-hidden="true" className={s.left} style={{y}}>
      {frame.tickers.map(t => <div className={s.item} key={t.symbol}>
        <span className={s.symbol}>{t.symbol}</span><Price value={t.last} animate={active && !still}/>
        <span className={s.change} data-positive={t.change24h >= 0}>{t.change24h >= 0 ? "▴ +" : "▾ "}{t.change24h.toFixed(2)}% <small>24h</small></span>
        <Sparkline ticker={t}/>
      </div>)}
    </motion.aside>
    <motion.aside aria-hidden="true" className={s.right} style={{y}}>
      {frame.tickers.map(t => <div className={s.item} key={t.symbol}>
        <span className={s.symbol}>{t.symbol}</span>
        <dl><div><dt>Mark price</dt><dd><Price value={t.mark} animate={active && !still}/></dd></div>
          <div><dt>Funding</dt><dd>{(t.fundingRate*100).toFixed(4)}%</dd></div>
          <div><dt>24h volume</dt><dd>{volumeFormat.format(t.volume24h)} <span className={s.unit}>{t.symbol.replace("USDT", "")}</span></dd></div></dl>
      </div>)}
    </motion.aside>
  </div>;
}
