import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Landing } from "../src/components/landing/landing";
import { riskState, sampleOpening, sampleRules, simulateDay } from "../src/components/landing/landing-data";

describe("quiet precision landing", () => {
  it("keeps the five-section scope, headline, and labeled reference figures", () => {
    const html = renderToStaticMarkup(<Landing />);
    expect(html.match(/<section\b/g)).toHaveLength(5);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Less noise.");
    expect(html).toContain("More nerve.");
    expect(html.match(/View program/g)).toHaveLength(3);
    expect(html.match(/REFERENCE FIGURES/g)).toHaveLength(3);
    expect(html).toContain("Sample account");
    expect(html).toContain('type="range"');
    expect(html).toContain('for="day-pnl"');
    expect(html).toContain('role="status"');
    expect(html).toContain("All trading uses simulated capital on Bybit Demo.");
  });
  it("exposes the initial sample values in accessible meters", () => {
    const html = renderToStaticMarkup(<Landing />);
    expect(html.match(/role="meter"/g)).toHaveLength(3);
    for (const rule of sampleRules) {
      expect(html).toContain(`aria-valuemax="${rule.limit}" aria-valuenow="${rule.value}"`);
    }
  });
  it("models sample equity from the disclosed opening and preserves boundary semantics", () => {
    expect(simulateDay(sampleOpening.day).map(rule=>rule.value)).toEqual([6.4,1.2,5.6]);
    expect(simulateDay(-4).map(rule=>rule.value)).toEqual([3.6,4,8.4]);
    expect(riskState(simulateDay(-4)[1].value,5)).toBe("warning");
    expect(riskState(simulateDay(-5)[1].value,5)).toBe("breach");
    expect(simulateDay(-6).map(rule=>rule.value)).toEqual([1.6,6,10.4]);
    expect(riskState(simulateDay(-3.6)[2].value,10)).toBe("warning");
    expect(riskState(simulateDay(-5.6)[2].value,10)).toBe("breach");
    expect(simulateDay(10).map(rule=>rule.value)).toEqual([17.6,0,0]);
    expect(simulateDay(-99)).toEqual(simulateDay(-6));
    expect(simulateDay(99)).toEqual(simulateDay(10));
    expect(riskState(7.9,10)).toBe("safe");
    expect(riskState(8,10)).toBe("warning");
  });
});
