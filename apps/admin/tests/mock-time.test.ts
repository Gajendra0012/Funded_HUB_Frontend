import { describe, expect, it } from "vitest";
import { dashboard, gallery, identity } from "../src/mocks/admin";
import { initialState } from "../src/mocks/legacy";
import { SAMPLE_NOW, sampleAt } from "../src/mocks/now";
describe("sample trading-day consistency",()=>{
 it("uses the same snapshot for the shell and all health checks",()=>{
  expect(identity.now).toBe(SAMPLE_NOW);expect(dashboard.asOf).toBe(SAMPLE_NOW);
  expect(dashboard.connections).toHaveLength(6);
  dashboard.connections.forEach(connection=>expect(Date.parse(connection.checkedAt)).toBe(Date.parse(SAMPLE_NOW)));
 });
 it("keeps all event timestamps at or before the snapshot",()=>{
  const times=[...dashboard.violations.map(row=>row.at),...gallery.timeline.map(row=>row.at),...initialState.events.map(row=>row.at),...initialState.users.flatMap(row=>row.lastLogin ? [row.lastLogin] : [])];
  times.forEach(at=>{expect(Number.isFinite(Date.parse(at))).toBe(true);expect(Date.parse(at)).toBeLessThanOrEqual(Date.parse(SAMPLE_NOW));});
  expect(Date.parse(SAMPLE_NOW)-Date.parse(sampleAt(8))).toBe(8000);
 });
});
