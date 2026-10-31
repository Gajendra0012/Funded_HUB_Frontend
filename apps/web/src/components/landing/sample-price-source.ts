import { sampleMarketSeeds } from "./sample-market-constants";

export type SampleQuote = { symbol: string; price: number; change: number };
export interface PriceSource {
  readonly snapshot: readonly SampleQuote[];
  subscribe(receive: (quotes: readonly SampleQuote[]) => void): () => void;
}

export const sampleQuotes: readonly SampleQuote[] = sampleMarketSeeds.map(q => ({symbol:q.symbol,price:q.last,change:q.change24h}));

// Deterministic teaching fixtures. This adapter never requests live market data.
export function sampleQuoteFrame(tick: number): readonly SampleQuote[] {
  if (tick === 0) return sampleQuotes;
  return sampleQuotes.map((quote, index) => {
    const drift = Math.sin(tick * .73 + index * 1.9) * .00018;
    return { ...quote, price: Number((quote.price * (1 + drift)).toFixed(2)), change: Number((quote.change + drift * 100).toFixed(2)) };
  });
}

export const samplePriceSource: PriceSource = {
  snapshot: sampleQuotes,
  subscribe(receive) {
    let tick = 0;
    const timer = setInterval(() => receive(sampleQuoteFrame(++tick)), 4000);
    return () => clearInterval(timer);
  },
};

export const priceFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function candleSeries() {
  let seed = 173, previous = 67580;
  return Array.from({ length: 48 }, (_, index) => {
    seed = (seed * 16807) % 2147483647;
    const open = previous;
    const close = open + (seed / 2147483647 - .38) * 160;
    previous = close;
    return { open, close, high: Math.max(open, close) + 25 + index % 5 * 9, low: Math.min(open, close) - 25 - index % 4 * 8 };
  });
}
