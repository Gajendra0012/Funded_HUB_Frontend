import { describe, expect, it } from "vitest";
import { config } from "../src/proxy";

// The matcher is a regular expression over the request path (Next.js proxy docs: negative lookahead).
const runsFor = (path: string) => new RegExp(`^${config.matcher[0]}$`).test(path);

describe("proxy.ts keeps the session fresh on pages only (WEB-04)", () => {
  it("runs for every page, including the ones that will need a login", () => {
    for (const path of ["/", "/login", "/signup", "/dashboard", "/dashboard/settings", "/dashboard/accounts/abc", "/legal/terms", "/auth/confirm"]) {
      expect(runsFor(path), path).toBe(true);
    }
  });

  it("skips Next.js build files, the self-hosted fonts and images", () => {
    for (const path of ["/_next/static/chunks/main.js", "/_next/image", "/favicon.ico", "/fonts/geist.woff2", "/icon.svg", "/og/cover.png"]) {
      expect(runsFor(path), path).toBe(false);
    }
  });
});
