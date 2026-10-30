import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { candleSeries, samplePriceSource, sampleQuoteFrame, sampleQuotes } from "../src/components/landing/sample-price-source";
import { SampleTicker, SampleTradingProvider, TradingDashboard } from "../src/components/landing/hero-trading";

describe("hero sample trading layer", () => {
  it("starts from deterministic fixtures and retains valid candle geometry", () => {
    expect(sampleQuoteFrame(0)).toEqual(sampleQuotes);
    expect(sampleQuoteFrame(1)).toEqual(sampleQuoteFrame(1));
    expect(sampleQuoteFrame(1)[0].price).not.toBe(sampleQuotes[0].price);
    expect(candleSeries()).toEqual(candleSeries());
    for (const candle of candleSeries()) {
      expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
      expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
    }
  });
  it("only ticks through an explicit subscription and stops after cleanup", () => {
    vi.useFakeTimers();
    try {
      const receive = vi.fn();
      const stop = samplePriceSource.subscribe(receive);
      expect(receive).not.toHaveBeenCalled();
      vi.advanceTimersByTime(4000);
      expect(receive).toHaveBeenCalledExactlyOnceWith(sampleQuoteFrame(1));
      stop();
      vi.advanceTimersByTime(12000);
      expect(receive).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it("server-renders labelled sample prices and account data without a running feed", () => {
    vi.useFakeTimers();
    try {
      const html = renderToStaticMarkup(<SampleTradingProvider><SampleTicker/><TradingDashboard/></SampleTradingProvider>);
      for (const text of ["Sample prices", "Sample account", "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "68,245.80", "simulated capital"]) expect(html).toContain(text);
      expect(html).toContain("<svg");
      expect(html).not.toContain("<canvas");
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
