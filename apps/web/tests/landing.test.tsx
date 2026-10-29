import { describe, expect, it } from "vitest";
import { accountSizes, challengeModels, getChallengePreview } from "../src/data/landing";

describe("reference challenge comparison", () => {
  it("keeps every account size paired with its reference fee", () => {
    for (const model of challengeModels) {
      expect(model.prices).toHaveLength(accountSizes.length);
      accountSizes.forEach((size, index) => {
        expect(getChallengePreview(model, size, false).price).toBe(model.prices[index]);
      });
    }
  });
  it("converts percentage limits and both phase targets to the selected account size", () => {
    const result = getChallengePreview(challengeModels[0], 10000, true);
    expect(result.target).toBe("$800 → $500");
    expect(result.dailyLoss).toBe("$500");
    expect(result.maxLoss).toBe("$1,000");
    expect(getChallengePreview(challengeModels[0], 100000, false).target).toBe("8% → 5%");
  });
  it("shows a single target for one-step and no evaluation target for instant", () => {
    expect(getChallengePreview(challengeModels[1], 5000, true).target).toBe("$500");
    expect(getChallengePreview(challengeModels[2], 200000, true).target).toBe("No evaluation");
    expect(getChallengePreview(challengeModels[2], 200000, true).maxLoss).toBe("$10,000");
  });
});
