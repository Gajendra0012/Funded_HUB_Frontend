import { describe, expect, it } from "vitest";
import { identityFromUser, splitName } from "../src/lib/auth/identity";
import { AUTH_MESSAGES, authErrorMessage, loginNotice } from "../src/lib/auth/messages";
import { qrImageSource, groupSecret } from "../src/lib/auth/mfa";
import { callbackUrl, isGuestOnlyPath, isProtectedPath, safeNextPath } from "../src/lib/auth/redirects";

describe("which pages need a login (WEB-10)", () => {
  it("protects the dashboard and checkout, and nothing else", () => {
    for (const path of ["/dashboard", "/dashboard/settings", "/checkout", "/checkout/step"]) expect(isProtectedPath(path), path).toBe(true);
    for (const path of ["/", "/login", "/signup", "/reset-password", "/auth/callback", "/dashboards", "/legal/terms"]) expect(isProtectedPath(path), path).toBe(false);
  });

  it("sends signed-in traders away from login and sign-up only", () => {
    expect(isGuestOnlyPath("/login")).toBe(true);
    expect(isGuestOnlyPath("/signup")).toBe(true);
    expect(isGuestOnlyPath("/reset-password")).toBe(false);
  });
});

describe("where to go after signing in", () => {
  it("keeps paths on this site, with query and hash", () => {
    expect(safeNextPath("/dashboard/payouts?tab=open#top")).toBe("/dashboard/payouts?tab=open#top");
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
  });

  it("never leaves the site, and never loops back to an auth page", () => {
    for (const value of [null, "", "dashboard", "//evil.example", "https://evil.example", "/\\evil.example", "/login", "/signup?x=1", "/auth/callback"]) {
      expect(safeNextPath(value), String(value)).toBe("/dashboard");
    }
  });

  it("builds the callback address from the site's own address", () => {
    expect(callbackUrl("http://127.0.0.1:3000", "/dashboard/settings")).toBe("http://127.0.0.1:3000/auth/callback?next=%2Fdashboard%2Fsettings");
    expect(callbackUrl("https://www.example.com", "https://evil.example")).toBe("https://www.example.com/auth/callback?next=%2Fdashboard");
  });
});

describe("the trader's name and country", () => {
  it("uses sign-up names, then Google's name, then the email", () => {
    expect(identityFromUser({ email: "a@x.io", user_metadata: { first_name: "Alex", last_name: "Morgan", country_code: "gb" } })).toEqual({ name: "Alex Morgan", email: "a@x.io", country: "GB" });
    expect(identityFromUser({ email: "a@x.io", user_metadata: { full_name: "Sam Lee" } }).name).toBe("Sam Lee");
    expect(identityFromUser({ email: "jane.doe@x.io", user_metadata: {} })).toEqual({ name: "jane.doe", email: "jane.doe@x.io", country: "" });
    // The trader can edit their own metadata, so odd values must not break the page.
    expect(identityFromUser({ email: "a@x.io", user_metadata: { first_name: 42, country_code: "Mars" } })).toEqual({ name: "a", email: "a@x.io", country: "" });
  });

  it("splits a full name for sign-up", () => {
    expect(splitName("  Alex  van Morgan ")).toEqual({ first_name: "Alex", last_name: "van Morgan" });
    expect(splitName("Cher")).toEqual({ first_name: "Cher", last_name: "" });
  });
});

describe("auth messages", () => {
  it("keeps sign-in failures generic and spots temporary problems", () => {
    expect(authErrorMessage({ status: 400, code: "invalid_credentials" })).toBe(AUTH_MESSAGES.badCredentials);
    expect(authErrorMessage({ status: 400, code: "email_not_confirmed" })).toBe(AUTH_MESSAGES.notConfirmed);
    expect(authErrorMessage({ status: 429 })).toBe(AUTH_MESSAGES.tooMany);
    expect(authErrorMessage({ status: 0, name: "AuthRetryableFetchError" })).toBe(AUTH_MESSAGES.unavailable);
    expect(authErrorMessage({ status: 503 })).toBe(AUTH_MESSAGES.unavailable);
  });

  it("explains /login?error=… from the callback", () => {
    expect(loginNotice("link")).toBe(AUTH_MESSAGES.linkExpired);
    expect(loginNotice("google")).toBe(AUTH_MESSAGES.googleFailed);
    expect(loginNotice("anything-else")).toBeNull();
  });
});

describe("2FA setup helpers", () => {
  it("re-encodes Supabase's QR SVG so a '#' can't cut the image address short", () => {
    const src = qrImageSource('data:image/svg+xml;utf-8,<svg fill="#000"></svg>');
    expect(src.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(src).not.toContain("#");
  });

  it("groups the setup key for typing by hand", () => {
    expect(groupSecret("JBSWY3DPEHPK3PXP")).toBe("JBSW Y3DP EHPK 3PXP");
  });
});
