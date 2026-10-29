export const timing = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: { short: 0.3, base: 0.6, long: 1.2 },
};

// Teaching fixtures only. Today's P&L moves equity from this disclosed opening position.
export const sampleOpening = { profit: 7.6, drawdown: 4.4, day: -1.2 };
export function simulateDay(pnl: number) {
  const day = Math.max(-6, Math.min(10, pnl));
  const rounded = (value: number) => Math.round(Math.max(0, value) * 10) / 10;
  return [
    { name: "Profit target", value: rounded(sampleOpening.profit + day), limit: 8, detail: "progress toward target", kind: "target" },
    { name: "Daily loss", value: rounded(-day), limit: 5, detail: "daily allowance used", kind: "limit" },
    { name: "Max drawdown", value: rounded(sampleOpening.drawdown - day), limit: 10, detail: "total allowance used", kind: "limit" },
  ] as const;
}
export const sampleRules = simulateDay(sampleOpening.day);
export function riskState(value: number, limit: number) {
  return value >= limit ? "breach" : value >= limit * 0.8 ? "warning" : "safe";
}
export const programs = [
  { name: "1-Step", label: "A SINGLE EVALUATION", text: "One challenge phase before the funded-stage review.", capital: "$100K", share: "80%" },
  { name: "2-Step", label: "A TWO-PHASE EVALUATION", text: "A challenge, then a second phase to demonstrate consistency.", capital: "$100K", share: "80%" },
  { name: "Instant", label: "DIRECT TO THE FUNDED STAGE", text: "Begin at the simulated funded stage, subject to program eligibility.", capital: "$100K", share: "70%" },
];
