import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The sample's hero buttons use the Next.js router, which only exists inside a running app.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/" }));

const { default: LandingPage } = await import("../src/app/(main)/(marketing)/page");

// The server HTML is what search engines and slow connections see first,
// so every section and its key text must be in it, before any JavaScript runs.
const html = renderToStaticMarkup(<LandingPage />);

/** Every page URL in src/app, e.g. "/", "/challenges", "/dashboard/accounts/[id]". Route groups like (main) don't count. */
function appRoutes(dir = join(__dirname, "../src/app"), url = ""): string[] {
  const routes: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      const segment = name.startsWith("(") ? "" : `/${name}`;
      routes.push(...appRoutes(path, url + segment));
    } else if (name === "page.tsx") {
      routes.push(url || "/");
    }
  }
  return routes;
}

describe("home page (server HTML)", () => {
  it("renders every section, in order", () => {
    const ids = ["hero-title", "how-it-works", "challenges", "reach-title", "payouts", "platform", "leaderboard-title", "promises-title", "faq", "cta-title"];
    let last = -1;
    for (const id of ids) {
      const at = html.indexOf(`id="${id}"`);
      expect(at, `section ${id}`).toBeGreaterThan(last);
      last = at;
    }
  });

  it("shows the main messages", () => {
    for (const text of ["$200,000", "Start Challenge", "View Live Dashboard Demo", "Choose your", "Trade on", "Bybit Demo", "Questions, answered"]) {
      expect(html).toContain(text);
    }
  });

  it("labels sample data as sample", () => {
    expect(html).toContain("Example values");
    expect(html).toContain("Simulated");
  });

  it("does not hide content until JavaScript runs", () => {
    expect(html).not.toContain('data-reveal="pending"');
  });

  it("only links to sections on the page or to pages that exist", () => {
    const routes = appRoutes();
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      if (href.startsWith("#")) continue;
      const path = href.split(/[?#]/)[0];
      expect(routes, href).toContain(path);
    }
  });
});
