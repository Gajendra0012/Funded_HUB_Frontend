export const opening = { progress: 7.6, drawdown: 4.4, day: -1.2 };
export function simulateDay(input: number) {
  const day = Number.isFinite(input) ? Math.max(-6, Math.min(10, input)) : opening.day;
  return [
    { name: "Profit target", value: Math.max(0, opening.progress + day), limit: 8, target: true },
    { name: "Daily loss", value: Math.max(0, -day), limit: 5, target: false },
    { name: "Max drawdown", value: Math.max(0, opening.drawdown - day), limit: 10, target: false },
  ];
}
export function severity(value: number, limit: number) { return value >= limit ? "breach" : value >= limit * .8 ? "warning" : "safe"; }
export function equityPoints(day: number) {
  const end = 7.6 + Math.max(-6, Math.min(10, Number.isFinite(day) ? day : -1.2));
  return [0,.8,.4,1.6,1.1,2.8,2.2,3.4,3.1,4.8,4.4,5.9,5.2,6.7,6.2,7.6,end];
}
export function chartPath(values: readonly number[], width = 800, height = 220) {
  return values.map((value, i) => `${i ? "L" : "M"}${(i / (values.length - 1) * width).toFixed(1)},${(height - 20 - value / 20 * (height - 40)).toFixed(1)}`).join(" ");
}
export const programs = [
  { name: "1-Step", note: "One focused evaluation.", phases: ["Evaluation"], share: "up to 90%", line: [0,3,2,5,4,7,6,10,9,13,15] },
  { name: "2-Step", note: "A deliberate way forward.", phases: ["Phase 1", "Phase 2"], share: "up to 90%", line: [0,2,4,3,6,8,7,9,11,10,14] },
  { name: "Instant", note: "A different starting point.", phases: ["Direct to funded"], share: "up to 90%", line: [5,6,5,8,7,10,9,12,11,13,14] },
] as const;
