import { afterEach, describe, expect, it, vi } from "vitest";
import { bybitMarketSource, marketSnapshot, marketSymbols, mergeTicker, normalizeTicker, simulatedMarketSource, seededHistory } from "../src/components/landing/hero-market-source";

class Socket {
  static current: Socket;
  readyState = 1;
  onopen: (()=>void) | null = null;
  onmessage: ((event:{data:string})=>void) | null = null;
  onerror: (()=>void) | null = null;
  onclose: (()=>void) | null = null;
  send = vi.fn(); close = vi.fn();
  constructor(readonly url:string) { Socket.current = this; }
  packet(symbol:string, type="snapshot", fields:Record<string,string>={}) {
    this.onmessage?.({data:JSON.stringify({topic:"tickers."+symbol,type,data:type==="snapshot"?{symbol,lastPrice:"70000",markPrice:"70001",price24hPcnt:".025",fundingRate:".0001",volume24h:"73191.387",...fields}:fields})});
  }
}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe("hero market feed",()=>{
 it("merges omitted delta fields, converts percentages, and rejects invalid numbers",()=>{
   const snapshot={lastPrice:"70000",markPrice:"70001",price24hPcnt:".025",fundingRate:".0001",volume24h:"1234"};
   const merged=mergeTicker(snapshot,{lastPrice:"70002"},false)!;
   expect(snapshot.lastPrice).toBe("70000");
   expect(normalizeTicker("BTCUSDT",merged,[])?.change24h).toBe(2.5);
   expect(normalizeTicker("BTCUSDT",merged,[])?.mark).toBe(70001);
   expect(normalizeTicker("BTCUSDT",{...merged,fundingRate:""},[])).toBeNull();
   expect(normalizeTicker("BTCUSDT",{...merged,lastPrice:"Infinity"},[])).toBeNull();
   expect(mergeTicker(merged,{lastPrice:"4"},true)).toEqual({lastPrice:"4"});
 });
 it("simulates deterministically only after subscription, once per second, with cleanup",()=>{
   vi.useFakeTimers();const receive=vi.fn();
   expect(vi.getTimerCount()).toBe(0);
   const stop=simulatedMarketSource.subscribe(["BTCUSDT"],receive);
   vi.advanceTimersByTime(999);expect(receive).not.toHaveBeenCalled();
   vi.advanceTimersByTime(1);expect(receive).toHaveBeenCalledTimes(1);
   expect(receive.mock.calls[0][0].live).toBe(false);
   expect(receive.mock.calls[0][0].tickers).toHaveLength(1);
   expect(marketSnapshot).toHaveLength(4);stop();expect(vi.getTimerCount()).toBe(0);
 });
 it("batches live packets and merges symbol-less deltas without sample history",()=>{
   vi.useFakeTimers();vi.stubGlobal("WebSocket",Socket);const receive=vi.fn();
   const stop=bybitMarketSource.subscribe(marketSymbols,receive), ws=Socket.current;
   ws.onopen?.();expect(ws.url).toBe("wss://stream.bybit.com/v5/public/linear");
   expect(JSON.parse(ws.send.mock.calls[0][0]).args).toEqual(marketSymbols.map(s=>"tickers."+s));
   marketSymbols.forEach(s=>ws.packet(s));
   for(let i=0;i<100;i++)ws.packet("BTCUSDT","delta",{lastPrice:String(70000+i)});
   expect(receive).not.toHaveBeenCalled();vi.advanceTimersByTime(1000);
   expect(receive).toHaveBeenCalledTimes(1);
   const frame=receive.mock.calls[0][0];expect(frame.live).toBe(true);expect(frame.tickers[0].last).toBe(70099);
   expect(frame.tickers[0].mark).toBe(70001);expect(frame.tickers[0].history).toEqual([70099]);
   vi.advanceTimersByTime(1000);expect(receive).toHaveBeenCalledTimes(1);
   stop();expect(ws.close).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
 });
 it("falls back after ten seconds of missing ticker data, even if pongs arrive",()=>{
   vi.useFakeTimers();vi.stubGlobal("WebSocket",Socket);const receive=vi.fn();
   const stop=bybitMarketSource.subscribe(marketSymbols,receive),ws=Socket.current;
   ws.onmessage?.({data:JSON.stringify({op:"ping",success:true,ret_msg:"pong"})});
   vi.advanceTimersByTime(10000);expect(receive).not.toHaveBeenCalled();
   vi.advanceTimersByTime(1000);expect(receive.mock.calls.at(-1)?.[0].live).toBe(false);
   expect(ws.close).toHaveBeenCalledOnce();stop();expect(vi.getTimerCount()).toBe(0);
 });
 it("pings at twenty seconds and falls back on connection errors",()=>{
   vi.useFakeTimers();vi.stubGlobal("WebSocket",Socket);const receive=vi.fn();
   const stop=bybitMarketSource.subscribe(marketSymbols,receive),ws=Socket.current;
   for(let i=0;i<5;i++){marketSymbols.forEach(s=>ws.packet(s));vi.advanceTimersByTime(4000);}
   expect(ws.send.mock.calls.some(([packet])=>JSON.parse(packet).op==="ping")).toBe(true);
   ws.onerror?.();vi.advanceTimersByTime(1000);expect(receive.mock.calls.at(-1)?.[0].live).toBe(false);
   stop();expect(vi.getTimerCount()).toBe(0);
 });
});

describe("seeded rail histories",()=>{
 it("uses 48 noisy deterministic points with the correct signed net drift",()=>{
   for(const q of marketSnapshot){
     expect(q.history).toHaveLength(48);
     expect(Math.sign(q.history[47]-q.history[0])).toBe(Math.sign(q.change24h));
     const steps=q.history.slice(1).map((v,i)=>v-q.history[i]);
     expect(steps.some(v=>v>0)).toBe(true);expect(steps.some(v=>v<0)).toBe(true);
     expect(new Set(steps.map(v=>v.toFixed(5))).size).toBeGreaterThan(40);
   }
   expect(seededHistory(4201,100,2)).toEqual(seededHistory(4201,100,2));
   expect(seededHistory(4201,100,2)).not.toEqual(seededHistory(7733,100,2));
 });
});
