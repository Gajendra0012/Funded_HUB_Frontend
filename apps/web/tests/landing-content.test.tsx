import { describe, expect, it } from "vitest";
import { ACCOUNT_SIZES, MODELS } from "../src/data/plans";
import {
  accountSizes,
  faq,
  getProgram,
  globeCities,
  heroAccount,
  payoutMethods,
  popularPlan,
  programs,
  samplePayouts,
  steps,
} from "../src/data/landing";

// Bybit's restricted countries. The globe must never suggest traders there.
const BYBIT_RESTRICTED = ["US", "CN", "HK", "SG", "CA", "KP", "CU", "IR", "UZ", "SD", "SY"];

describe("landing content", () => {
  it("shows the same rules as data/plans.ts, which the challenges page and checkout use", () => {
    expect([...accountSizes]).toEqual([...ACCOUNT_SIZES]);
    for (const program of programs) {
      const model = MODELS[program.id];
      expect(program.targets.map((t) => t / 100), program.id).toEqual(model.profitTargets);
      expect(program.dailyLossPct / 100, program.id).toBeCloseTo(model.dailyLossPct);
      expect(program.maxLossPct / 100, program.id).toBeCloseTo(model.maxLossPct);
      expect(program.maxLossType.toLowerCase(), program.id).toBe(model.maxLossType);
      expect(program.minTradingDays, program.id).toBe(model.minTradingDays);
      expect(program.profitSharePct / 100, program.id).toBeCloseTo(model.rewardShare);
    }
  });

  it("highlights a plan that exists", () => {
    expect(programs.map((p) => p.id)).toContain(popularPlan.program);
    expect(accountSizes).toContain(popularPlan.size);
  });

  it("keeps the hero account consistent with the 2-Step $100K rules", () => {
    const twoStep = getProgram("two-step");
    expect(heroAccount.target).toBe(heroAccount.start * (1 + twoStep.targets[0] / 100));
    expect(heroAccount.dailyLossLimit).toBe((heroAccount.start * twoStep.dailyLossPct) / 100);
    expect(heroAccount.maxLossFloor).toBe(heroAccount.start * (1 - twoStep.maxLossPct / 100));
    expect(heroAccount.tradingDays.required).toBe(twoStep.minTradingDays);
  });

  it("never places globe cities in Bybit-restricted countries", () => {
    for (const city of globeCities) expect(BYBIT_RESTRICTED).not.toContain(city.country);
  });

  it("only uses the supported payout currencies", () => {
    for (const payout of samplePayouts) expect(payoutMethods).toContain(payout.method);
  });

  it("has four steps and a filled-in FAQ", () => {
    expect(steps).toHaveLength(4);
    expect(faq.length).toBeGreaterThanOrEqual(5);
    for (const item of faq) {
      expect(item.q.trim()).not.toBe("");
      expect(item.a.length).toBeGreaterThan(40);
    }
  });
});
