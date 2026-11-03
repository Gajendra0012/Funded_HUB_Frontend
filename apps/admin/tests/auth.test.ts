import { describe, expect, it } from "vitest";
import { decideAccess, safeNextPath } from "../src/lib/auth/access";
import { ADMIN_SESSION_HOURS, displayName, initialsOf, sessionExpiresAt, sessionStartedAt, sessionState, type SessionClaims } from "../src/lib/auth/claims";
import { groupSecret, LOGIN_MESSAGES, loginErrorMessage, nextLoginStep, qrImageSource } from "../src/lib/auth/login-step";
import { formatRemaining } from "../src/components/session-countdown";

const SIGNED_IN_AT = 1_762_000_000; // seconds
const HOUR = 60 * 60;

/** A session that signed in with a password at SIGNED_IN_AT and, for aal2, entered the 2FA code a minute later. */
function claims(aal: "aal1" | "aal2", extra: Partial<SessionClaims> = {}): SessionClaims {
  const amr = aal === "aal2" ? [{ method: "totp", timestamp: SIGNED_IN_AT + 60 }, { method: "password", timestamp: SIGNED_IN_AT }] : [{ method: "password", timestamp: SIGNED_IN_AT }];
  return { sub: "user-1", email: "admin@example.com", aal, amr, ...extra };
}

describe("session timing (ADM-15: 12-hour admin session)", () => {
  it("starts at the password sign-in and ends 12 hours later", () => {
    expect(sessionStartedAt(claims("aal2"))).toBe(SIGNED_IN_AT);
    expect(sessionExpiresAt(claims("aal2"))).toBe(SIGNED_IN_AT + ADMIN_SESSION_HOURS * HOUR);
  });

  it("uses the earliest step when there is no password step", () => {
    expect(sessionStartedAt({ sub: "u", amr: [{ method: "totp", timestamp: 500 }, { method: "otp", timestamp: 400 }] })).toBe(400);
  });

  it("is active with password + code under 12 hours, and expired at 12 hours", () => {
    expect(sessionState(claims("aal2"), SIGNED_IN_AT + 11 * HOUR + 3599)).toBe("active");
    expect(sessionState(claims("aal2"), SIGNED_IN_AT + 12 * HOUR)).toBe("expired");
  });

  it("needs the 2FA code after the password alone", () => {
    expect(sessionState(claims("aal1"), SIGNED_IN_AT + HOUR)).toBe("needs-2fa");
  });

  it("treats a session without a readable sign-in time as expired (fail safe)", () => {
    expect(sessionState({ sub: "u", aal: "aal2" }, SIGNED_IN_AT)).toBe("expired");
    expect(sessionState({ sub: "u", aal: "aal2", amr: ["password", "totp"] }, SIGNED_IN_AT)).toBe("expired");
  });

  it("is signed out without a session", () => {
    expect(sessionState(null, SIGNED_IN_AT)).toBe("signed-out");
  });

  it("shows the profile name, or the email", () => {
    expect(displayName(claims("aal2", { user_metadata: { first_name: "Local", last_name: "Admin" } }))).toBe("Local Admin");
    expect(displayName(claims("aal2"))).toBe("admin@example.com");
    // The user can edit their own metadata, so odd values must not break the page.
    expect(displayName(claims("aal2", { user_metadata: { first_name: 42, last_name: null } }))).toBe("admin@example.com");
    expect(initialsOf("Local Admin")).toBe("LA");
    expect(initialsOf("admin@example.com")).toBe("AD");
    expect(initialsOf("jane.doe@example.com")).toBe("JD");
  });
});

describe("page protection rules (ADM-16)", () => {
  const at = (hours: number) => SIGNED_IN_AT + hours * HOUR;

  it("sends signed-out visitors to /login and brings them back afterwards", () => {
    expect(decideAccess({ pathname: "/traders", search: "?status=Active", claims: null, nowSeconds: at(1) })).toEqual({
      action: "redirect",
      location: "/login?next=%2Ftraders%3Fstatus%3DActive",
      signOut: false,
    });
  });

  it("refuses a session that has only the password (no 2FA code yet)", () => {
    const decision = decideAccess({ pathname: "/", search: "", claims: claims("aal1"), nowSeconds: at(1) });
    expect(decision.action).toBe("redirect");
    expect(decision.location).toBe("/login?next=%2F");
  });

  it("lets an active session through", () => {
    expect(decideAccess({ pathname: "/audit-log", search: "", claims: claims("aal2"), nowSeconds: at(2) })).toEqual({ action: "allow", signOut: false });
  });

  it("ends a session after 12 hours and says why", () => {
    expect(decideAccess({ pathname: "/settings", search: "", claims: claims("aal2"), nowSeconds: at(12) })).toEqual({
      action: "redirect",
      location: "/login?reason=expired",
      signOut: true,
    });
  });

  it("keeps /login open, resumes a half-finished sign-in, and clears an expired one", () => {
    expect(decideAccess({ pathname: "/login", search: "", claims: null, nowSeconds: at(1) })).toEqual({ action: "allow", signOut: false });
    expect(decideAccess({ pathname: "/login", search: "", claims: claims("aal1"), nowSeconds: at(1) })).toEqual({ action: "allow", signOut: false });
    expect(decideAccess({ pathname: "/login", search: "", claims: claims("aal2"), nowSeconds: at(13) })).toEqual({ action: "allow", signOut: true });
  });

  it("skips /login for an active session, going to the requested page", () => {
    expect(decideAccess({ pathname: "/login", search: "?next=%2Froles", claims: claims("aal2"), nowSeconds: at(1) })).toEqual({
      action: "redirect",
      location: "/roles",
      signOut: false,
    });
  });

  it("only returns to pages on this site after login", () => {
    expect(safeNextPath("/traders?status=Active#top")).toBe("/traders?status=Active#top");
    expect(safeNextPath(null)).toBe("/");
    for (const unsafe of ["//evil.example", "https://evil.example/x", "/\\evil.example", "javascript:alert(1)", "evil", "/login", "/login?next=/x"]) {
      expect(safeNextPath(unsafe), unsafe).toBe("/");
    }
  });
});

describe("login steps (ADM-12 – ADM-14)", () => {
  it("asks for email and password first", () => {
    expect(nextLoginStep({ signedIn: false, currentLevel: null, verifiedTotpFactorIds: [] })).toBe("credentials");
  });

  it("forces 2FA setup on first login, with no way to skip it", () => {
    expect(nextLoginStep({ signedIn: true, currentLevel: "aal1", verifiedTotpFactorIds: [] })).toBe("enroll");
  });

  it("asks for the 6-digit code on later logins", () => {
    expect(nextLoginStep({ signedIn: true, currentLevel: "aal1", verifiedTotpFactorIds: ["factor-1"] })).toBe("verify");
  });

  it("is done once the code was entered (aal2)", () => {
    expect(nextLoginStep({ signedIn: true, currentLevel: "aal2", verifiedTotpFactorIds: ["factor-1"] })).toBe("done");
  });

  it("keeps sign-in errors generic, and explains rate limits and outages", () => {
    expect(loginErrorMessage({ status: 400, code: "invalid_credentials" }, "credentials")).toBe(LOGIN_MESSAGES.generic);
    expect(loginErrorMessage({ status: 400, code: "email_not_confirmed" }, "credentials")).toBe(LOGIN_MESSAGES.generic);
    expect(loginErrorMessage({ status: 422, code: "mfa_verification_failed" }, "code")).toBe(LOGIN_MESSAGES.wrongCode);
    expect(loginErrorMessage({ status: 429 }, "code")).toBe(LOGIN_MESSAGES.tooMany);
    expect(loginErrorMessage({ status: 503 }, "credentials")).toBe(LOGIN_MESSAGES.unavailable);
  });

  it("says 'unavailable' when there is no connection, instead of blaming the password or code", () => {
    const offline = { name: "AuthRetryableFetchError", status: 0 };
    expect(loginErrorMessage(offline, "credentials")).toBe(LOGIN_MESSAGES.unavailable);
    expect(loginErrorMessage(offline, "code")).toBe(LOGIN_MESSAGES.unavailable);
  });

  it("re-encodes the QR code so a '#' in the SVG can't break it", () => {
    const source = qrImageSource('data:image/svg+xml;utf-8,<svg fill="#000"><rect/></svg>');
    expect(source.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(source).not.toContain("#");
    expect(decodeURIComponent(source.split(",")[1])).toBe('<svg fill="#000"><rect/></svg>');
  });

  it("groups the setup key in fours for typing", () => {
    expect(groupSecret("JBSWY3DPEHPK3PXP")).toBe("JBSW Y3DP EHPK 3PXP");
  });
});

describe("session countdown (ADM-15)", () => {
  it("shows hours and minutes left", () => {
    expect(formatRemaining(12 * HOUR * 1000)).toBe("12:00");
    expect(formatRemaining((11 * HOUR + 42 * 60) * 1000 + 59_000)).toBe("11:42");
    expect(formatRemaining(-5_000)).toBe("0:00");
  });
});
