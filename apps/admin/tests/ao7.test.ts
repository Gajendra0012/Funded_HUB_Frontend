import { beforeEach, describe, expect, it, vi } from "vitest";

// A stand-in for Supabase's browser client: only the MFA calls the fresh-code check makes.
const mfa = { listFactors: vi.fn(), challengeAndVerify: vi.fn() };
vi.mock("@/lib/supabase/browser", () => ({ getBrowserSupabase: () => ({ auth: { mfa } }) }));

const { verifyFreshCode, NO_AUTHENTICATOR } = await import("../src/lib/auth/fresh-code");
const { LOGIN_MESSAGES } = await import("../src/lib/auth/login-step");
const { activeNavHref, navCurrent } = await import("../src/lib/navigation");
const { dashboard, navigation } = await import("../src/mocks/admin");

const factor = { id: "factor-1", factor_type: "totp", status: "verified" };

describe("fresh 2FA code before a change (ADM-19)", () => {
  beforeEach(() => {
    mfa.listFactors.mockReset().mockResolvedValue({ data: { all: [factor], totp: [factor], phone: [] }, error: null });
    mfa.challengeAndVerify.mockReset().mockResolvedValue({ data: {}, error: null });
  });

  it("a right code: a new challenge on the admin's authenticator, then verify", async () => {
    expect(await verifyFreshCode("123456")).toEqual({ ok: true });
    expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: "factor-1", code: "123456" });
  });

  it("a wrong code says so; a rate limit or no connection get their own message", async () => {
    mfa.challengeAndVerify.mockResolvedValueOnce({ data: null, error: { status: 422, code: "mfa_verification_failed", name: "AuthApiError" } });
    expect(await verifyFreshCode("000000")).toEqual({ ok: false, message: LOGIN_MESSAGES.wrongCode });
    mfa.challengeAndVerify.mockResolvedValueOnce({ data: null, error: { status: 429, code: "over_request_rate_limit", name: "AuthApiError" } });
    expect(await verifyFreshCode("000000")).toEqual({ ok: false, message: LOGIN_MESSAGES.tooMany });
    mfa.challengeAndVerify.mockResolvedValueOnce({ data: null, error: { status: 0, name: "AuthRetryableFetchError" } });
    expect(await verifyFreshCode("000000")).toEqual({ ok: false, message: LOGIN_MESSAGES.unavailable });
  });

  it("no authenticator: says how to set one up, and sends no code", async () => {
    mfa.listFactors.mockResolvedValueOnce({ data: { all: [], totp: [], phone: [] }, error: null });
    expect(await verifyFreshCode("123456")).toEqual({ ok: false, message: NO_AUTHENTICATOR });
    expect(mfa.challengeAndVerify).not.toHaveBeenCalled();
  });
});

describe("the sidebar marks the right item (ADM-03)", () => {
  const hrefs = navigation.flatMap((group) => group.items.map((item) => item.href));

  it("a page marks itself; an alias marks the page it shows", () => {
    expect(activeNavHref("/roles", hrefs)).toBe("/roles");
    expect(activeNavHref("/users", hrefs)).toBe("/admin-users");
    expect(activeNavHref("/audit", hrefs)).toBe("/audit-log");
    expect(activeNavHref("/kyc-queue", hrefs)).toBe("/kyc");
    expect(navCurrent("/users", "/admin-users", hrefs)).toBe("page");
  });

  it("a detail page marks its list as the location", () => {
    expect(activeNavHref("/traders/TRD-1001", hrefs)).toBe("/traders");
    expect(activeNavHref("/kyc/KYC-201", hrefs)).toBe("/kyc");
    expect(activeNavHref("/orders/ORD-9", hrefs)).toBe("/orders");
    expect(activeNavHref("/violations/VIO-1048", hrefs)).toBe("/violations");
    expect(navCurrent("/traders/TRD-1001", "/traders", hrefs)).toBe("location");
    expect(navCurrent("/traders/TRD-1001", "/", hrefs)).toBeUndefined();
  });

  it("the dashboard is only marked on the dashboard", () => {
    expect(activeNavHref("/", hrefs)).toBe("/");
    expect(activeNavHref("/dev/components", hrefs)).toBeNull();
  });

  it("the dashboard's KYC card opens the KYC page", () => {
    expect(dashboard.queues.find((queue) => queue.title === "KYC queue")?.href).toBe("/kyc");
  });
});
