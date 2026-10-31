import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LandingExperience } from "../src/components/landing/landing-experience";
import { Reveal, SectionTitle } from "../src/components/landing/cinematic-motion";

describe("complete landing content before browser observers", () => {
  it("server-renders every section with product content and no placeholders", () => {
    const html = renderToStaticMarkup(<LandingExperience className=""/>);
    for (const id of ["how-it-works", "risk-monitor", "programs", "payouts", "next-chapter"]) expect(html).toContain('id="'+id+'"');
    for (const text of ["Choose a program", "Simulate your day", "Reference figures", "Payouts are real.", "first challenge."]) expect(html).toContain(text);
    expect(html).not.toContain('aria-busy="true"');
    expect(html).toContain("MacBook Pro");
    expect(html).toContain("data-hero-market-window");
    expect(html.slice(html.indexOf('data-section="how-it-works"'))).not.toMatch(/opacity:0|translateY\(105%\)/);
  });
  it("keeps reveal content visible and serif opt-in in static markup", () => {
    const html = renderToStaticMarkup(<Reveal><SectionTitle id="test-title" first="Always" accent="readable"/></Reveal>);
    expect(html).toContain("readable");
    expect(html).not.toMatch(/opacity:0|visibility:hidden/);
    expect(html).not.toContain("serif");
  });
});
