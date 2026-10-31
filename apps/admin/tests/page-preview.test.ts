import { afterEach, describe, expect, it, vi } from "vitest";
import { pagePreview } from "../src/lib/page-preview";
import { workspace } from "../src/mocks/workspace";
afterEach(()=>vi.unstubAllEnvs());
describe("temporary page-state previews",()=>{
 it("honors the three named development previews and ignores unknown values",async()=>{
  vi.stubEnv("NODE_ENV","development");
  for(const state of ["loading","empty","error"] as const) expect(await pagePreview(Promise.resolve({state}))).toBe(state);
  expect(await pagePreview(Promise.resolve({state:"unknown"}))).toBe("default");
 });
 it("never exposes preview states in production",async()=>{
  vi.stubEnv("NODE_ENV","production");
  expect(await pagePreview(Promise.resolve({state:"error"}))).toBe("default");
 });
 it("preserves the explicitly listed permissions and 11 grouped rules",()=>{
  expect(workspace.permissions).toHaveLength(16);
  expect(workspace.ruleGroups.flatMap(group=>group.rules)).toHaveLength(11);
  expect(new Set(workspace.backupCodes).size).toBe(10);
 });
});
