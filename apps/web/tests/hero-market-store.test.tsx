import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SampleTradingProvider, TradingDashboard } from "../src/components/landing/hero-trading";
import { HeroDataRails } from "../src/components/landing/hero-data-rails";
import { marketSnapshot } from "../src/components/landing/hero-market-source";
import { priceFormat } from "../src/components/landing/sample-price-source";

describe("one hero market state",()=>{
 it("renders the same last price in the left rail, ticker and dashboard",()=>{
   const html=renderToStaticMarkup(<SampleTradingProvider><HeroDataRails/><TradingDashboard/></SampleTradingProvider>);
   const last=priceFormat.format(marketSnapshot[0].last);
   expect(html.split(last).length-1).toBe(3);
   expect(html).toContain(priceFormat.format(marketSnapshot[0].mark));
   expect(html).toContain("MacBook Pro");
   expect(html).toContain("Sample prices");
 });
});
