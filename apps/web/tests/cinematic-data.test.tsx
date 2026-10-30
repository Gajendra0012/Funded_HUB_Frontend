import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chartPath, equityPoints, severity, simulateDay } from "../src/components/landing/cinematic-data";
import { RiskMonitor, Programs, Payouts } from "../src/components/landing/cinematic-sections";

describe("cinematic landing sample instruments",()=>{
  it("preserves opening arithmetic, limit boundaries, and finite chart paths",()=>{
    expect(simulateDay(-1.2).map(r=>r.value)).toEqual([6.3999999999999995,1.2,5.6000000000000005]);
    expect(severity(4,5)).toBe("warning");
    expect(severity(5,5)).toBe("breach");
    expect(simulateDay(-99)).toEqual(simulateDay(-6));
    expect(simulateDay(99)).toEqual(simulateDay(10));
    expect(simulateDay(NaN)).toEqual(simulateDay(-1.2));
    for(const day of [-6,-1.2,0,10])expect(chartPath(equityPoints(day))).not.toMatch(/NaN|Infinity/);
    expect(chartPath(equityPoints(-6))).not.toBe(chartPath(equityPoints(10)));
  });
  it("exposes the slider, honest sample labels, and accessible capped meters",()=>{
    const html=renderToStaticMarkup(<RiskMonitor/>);
    expect(html).toContain('for="cinematic-day-pnl"');
    expect(html).toContain('aria-describedby="risk-sample-note"');
    expect(html.match(/role="meter"/g)).toHaveLength(3);
    expect(html).toContain("Sample account");
    expect(html).toContain("Within limits");
    expect(html).toContain("not live risk data".toUpperCase());
  });
  it("keeps program and payout figures labelled as illustrations",()=>{
    const html=renderToStaticMarkup(<Programs/>);
    expect(html.match(/Reference figures/g)).toHaveLength(3);
    expect(html).toContain("Phase 2");
    expect(html).toContain("Direct to funded");
    const payout=renderToStaticMarkup(<Payouts/>);
    for(const label of ["Sample","640.00","80% split","USDT","USDC","BTC","Requested","Reviewed","Paid","Not a real payment"])expect(payout).toContain(label);
  });
});
