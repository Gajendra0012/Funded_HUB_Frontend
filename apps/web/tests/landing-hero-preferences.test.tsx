import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useStaticHero } from "../src/components/landing/use-static-hero";

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock("../src/components/landing/use-motion-preference", () => ({ useMotionPreference: () => preference.reduced }));
// Exercise the client snapshot without adding a DOM or renderer dependency.
vi.mock("react", async original => ({ ...await original<typeof import("react")>(), useSyncExternalStore: (_subscribe: unknown, snapshot: () => boolean) => snapshot() }));
function Probe() { return <span>{useStaticHero() ? "static" : "animated"}</span>; }
afterEach(() => { vi.unstubAllGlobals(); preference.reduced = false; });
describe("hero resource preferences", () => {
  it("uses a still hero for Save-Data", () => {
    vi.stubGlobal("navigator", { connection: { saveData: true } });
    expect(renderToStaticMarkup(<Probe />)).toContain("static");
  });
  it("uses a still hero for reduced motion regardless of the connection", () => {
    vi.stubGlobal("navigator", { connection: { saveData: false } });
    preference.reduced = true;
    expect(renderToStaticMarkup(<Probe />)).toContain("static");
  });
  it("allows animation when preferences permit it, including browsers without Network Information", () => {
    vi.stubGlobal("navigator", {});
    expect(renderToStaticMarkup(<Probe />)).toContain("animated");
  });
});
