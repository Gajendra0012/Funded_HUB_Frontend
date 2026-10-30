import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Landing } from "../src/components/landing/landing";
import { globeAssets } from "../src/components/landing/video-playback";

describe("Funded HUB globe landing", () => {
  it("replaces the old page with one full-viewport hero and Funded HUB copy", () => {
    const html = renderToStaticMarkup(<Landing />);
    expect(html.match(/<section\b/g)).toHaveLength(1);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    for (const text of ["Funded HUB", "Your edge.", "Amplified.", "Bybit Demo", "Simulated capital."]) expect(html).toContain(text);
    for (const old of ["Less noise.", "More nerve.", "Risk Monitor", "Sample open positions", "View program", "<canvas", 'type="range"']) expect(html).not.toContain(old);
  });

  it("renders two poster-backed videos without requesting motion before preferences resolve", () => {
    const html = renderToStaticMarkup(<Landing />);
    expect(html.match(/<video\b/g)).toHaveLength(2);
    expect(html.match(/preload="none"/g)).toHaveLength(2);
    expect(html.match(/playsInline=""/g)).toHaveLength(2);
    expect(html).toContain(globeAssets.poster);
    expect(html).not.toContain(globeAssets.video);
    expect(html).not.toContain("Pause background");
  });

  it("provides accessible menu and dialog actions without dead destination routes", () => {
    const html = renderToStaticMarkup(<Landing />);
    expect(html).toContain('aria-controls="landing-menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain('aria-labelledby="landing-dialog-title"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain("No live accounts, purchases, or payouts are connected.");
    expect(html).not.toContain('href="/programs"');
    expect(html).not.toContain('href="#');
  });
});
