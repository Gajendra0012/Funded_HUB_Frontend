import { sampleMarketSeeds } from "./sample-market-constants";
import { sampleQuoteFrame } from "./sample-price-source";

export const marketSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"] as const;
export type MarketSymbol = typeof marketSymbols[number];
export type MarketTicker = { symbol: MarketSymbol; last: number; mark: number; change24h: number; fundingRate: number; volume24h: number; history: readonly number[] };
export type MarketUpdate = { tickers: readonly MarketTicker[]; live: boolean };
export interface MarketSource { subscribe(symbols: readonly MarketSymbol[], onUpdate: (update: MarketUpdate) => void): () => void }
export function seededHistory(seed: number, last: number, change24h: number): readonly number[] {
  let state = seed, value = 0;
  const walk = Array.from({length:48}, (_, i) => {
    state = state * 16807 % 2147483647;
    if (i) value += (state / 2147483647 - .5) * 1.8;
    return value;
  });
  const target = Math.sign(change24h) * (3 + Math.abs(change24h) * .25);
  const correction = target - walk[47];
  return walk.map((v,i) => last * (1 + (v + correction * i / 47 - target) * .0008));
}
export const marketSnapshot: readonly MarketTicker[] = sampleMarketSeeds.map(q => ({
  symbol:q.symbol,last:q.last,mark:q.mark,change24h:q.change24h,fundingRate:q.fundingRate,volume24h:q.volume24h,
  history:seededHistory(q.seed,q.last,q.change24h),
}));
function sampleFrame(tick: number, symbols: readonly MarketSymbol[]): MarketUpdate {
  const quotes = sampleQuoteFrame(tick);
  return { live: false, tickers: marketSnapshot.filter(q => symbols.includes(q.symbol)).map(q => {
    const i = marketSymbols.indexOf(q.symbol), last = quotes[i].price;
    return {...q, last, mark: Number((last + (q.mark - q.last)).toFixed(2)), history: seededHistory(sampleMarketSeeds[i].seed,last,quotes[i].change)};
  }) };
}
export const simulatedMarketSource: MarketSource = {
  subscribe(symbols, onUpdate) {
    let tick = 0;
    const timer = setInterval(() => onUpdate(sampleFrame(++tick, symbols)), 1000);
    return () => clearInterval(timer);
  },
};

type RawTicker = Record<string, unknown>;
// V5 linear snapshots replace a symbol's fields; deltas omit unchanged fields.
// https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
export function mergeTicker(previous: RawTicker | undefined, data: unknown, snapshot: boolean): RawTicker | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return {...(snapshot ? {} : previous), ...data};
}
function numberField(data: RawTicker, key: string) {
  const raw = data[key];
  return typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
}
export function normalizeTicker(symbol: MarketSymbol, data: RawTicker, history: readonly number[]): MarketTicker | null {
  const last = numberField(data, "lastPrice"), mark = numberField(data, "markPrice");
  const change24h = numberField(data, "price24hPcnt") * 100, fundingRate = numberField(data, "fundingRate"), volume24h = numberField(data, "volume24h");
  if (![last,mark,change24h,fundingRate,volume24h].every(Number.isFinite) || last <= 0 || mark <= 0 || volume24h < 0) return null;
  return {symbol,last,mark,change24h,fundingRate,volume24h,history: [...history.slice(-47),last]};
}

export const bybitMarketSource: MarketSource = {
  subscribe(symbols, onUpdate) {
    let socket: WebSocket | undefined, disposed = false, fallback = false, tick = 0, dirty = false;
    let lastPing = Date.now();
    const started = Date.now();
    const raw = new Map<MarketSymbol, RawTicker>(), received = new Map<MarketSymbol, number>();
    const histories = new Map<MarketSymbol, readonly number[]>();
    const disconnect = () => {
      if (!socket) return;
      socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
      socket.close(); socket = undefined;
    };
    const fail = () => { if (disposed || fallback) return; fallback = true; disconnect(); };
    const timer = setInterval(() => {
      if (disposed) return;
      const now = Date.now();
      if (!fallback && symbols.some(s => now - (received.get(s) ?? started) > 10000)) fail();
      if (fallback) { onUpdate(sampleFrame(++tick, symbols)); return; }
      if (socket?.readyState === 1 && now - lastPing >= 20000) {
        try { socket.send(JSON.stringify({op: "ping"})); lastPing = now; } catch { fail(); }
      }
      if (!dirty || fallback) return;
      const tickers = symbols.map(symbol => { const fields = raw.get(symbol); return fields ? normalizeTicker(symbol, fields, histories.get(symbol) ?? []) : null; });
      // Never mix simulated values into a frame labelled live.
      if (tickers.some(t => !t)) return;
      const complete = tickers as MarketTicker[];
      complete.forEach(t => histories.set(t.symbol, t.history));
      dirty = false; onUpdate({tickers: complete, live: true});
    }, 1000);
    try {
      socket = new WebSocket("wss://stream.bybit.com/v5/public/linear");
      socket.onopen = () => { try { socket?.send(JSON.stringify({op: "subscribe", args: symbols.map(s => "tickers." + s)})); } catch { fail(); } };
      socket.onmessage = event => {
        if (disposed || fallback) return;
        try {
          const message = JSON.parse(String(event.data));
          if (message.success === false) { fail(); return; }
          if (message.type !== "snapshot" && message.type !== "delta") return;
          const symbol = typeof message.topic === "string" ? message.topic.replace(/^tickers\./, "") as MarketSymbol : undefined;
          if (!symbol || !symbols.includes(symbol) || (message.data?.symbol !== undefined && message.data.symbol !== symbol)) return;
          if (message.type === "delta" && !raw.has(symbol)) return;
          const fields = mergeTicker(raw.get(symbol), message.data, message.type === "snapshot");
          if (!fields || !normalizeTicker(symbol, fields, [])) return;
          raw.set(symbol, fields); received.set(symbol, Date.now()); dirty = true;
        } catch { /* Ignore malformed/non-ticker packets; silence watchdog still applies. */ }
      };
      socket.onerror = fail; socket.onclose = fail;
    } catch { fail(); }
    return () => { disposed = true; clearInterval(timer); disconnect(); raw.clear(); histories.clear(); received.clear(); };
  },
};

export const heroMarketSource = process.env.NEXT_PUBLIC_MARKET_FEED === "bybit" ? bybitMarketSource : simulatedMarketSource;
