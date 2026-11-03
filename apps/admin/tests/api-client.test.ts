import { describe, expect, it, vi } from "vitest";
import { buildUrl, createAdminApi, type AdminApiConfig, type TokenResult } from "../src/lib/api/client";
import { API_MESSAGES, type BackendErrorCode } from "../src/lib/api/errors";

const BASE = "http://api.test";
const USER_ID = "4528cf78-d97e-4440-aae5-a98f1bf1b9ec";
const TRADER = { id: USER_ID, email: "jane@example.com" };

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const errorReply = (status: number, code: string, message = "Backend says no", fields?: Record<string, string>) =>
  json(status, { error: { code, message, ...(fields ? { fields } : {}) } });

type Step = Response | Error | ((init: RequestInit) => Promise<Response>);

/** A fake backend that answers with `steps`, one per request, and records every request. */
function setup(steps: Step[], overrides: Partial<AdminApiConfig> = {}) {
  const calls: { url: string; init: RequestInit; authorization: string | null }[] = [];
  const fetch = vi.fn(async (url: string | URL | Request, init: RequestInit = {}) => {
    calls.push({ url: String(url), init, authorization: new Headers(init.headers).get("authorization") });
    const step = steps.shift();
    if (!step) throw new Error("No more answers");
    if (step instanceof Error) throw step;
    return typeof step === "function" ? step(init) : step;
  });
  const sleeps: number[] = [];
  const onSessionEnded = vi.fn();
  const api = createAdminApi({
    baseUrl: BASE,
    getAccessToken: async () => ({ token: "token-1" }),
    refreshAccessToken: async () => ({ token: "token-2" }),
    onSessionEnded,
    fetch: fetch as typeof globalThis.fetch,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    random: () => 0.5,
    ...overrides,
  });
  return { api, calls, sleeps, onSessionEnded };
}

const listPage = (items: unknown[], next: string | null = null) => json(200, { data: items, meta: { next_cursor: next } });

describe("requests (ADM-09)", () => {
  it("sends the 2FA token, never cookies, and reads the { data, meta } answer", async () => {
    const { api, calls } = setup([listPage([TRADER], "c2")]);
    const result = await api.get("/api/v1/admin/traders", { query: { q: "jane", status: undefined, limit: 5 } });
    expect(result).toEqual({ ok: true, status: 200, data: [TRADER], meta: { next_cursor: "c2" } });
    expect(calls[0].url).toBe(`${BASE}/api/v1/admin/traders?q=jane&limit=5`);
    expect(calls[0].authorization).toBe("Bearer token-1");
    expect(calls[0].init).toMatchObject({ method: "GET", credentials: "omit", cache: "no-store", redirect: "error" });
    expect(new Headers(calls[0].init.headers).get("content-type")).toBeNull();
  });

  it("sends JSON bodies and fills in path IDs safely", async () => {
    const { api, calls } = setup([json(200, { data: { key: "platform_name" }, meta: {} })]);
    await api.put("/api/v1/admin/settings/{key}", { path: { key: "platform_name" }, body: { value: "Funded HUB" } });
    expect(calls[0].init.method).toBe("PUT");
    expect(calls[0].init.body).toBe('{"value":"Funded HUB"}');
    expect(new Headers(calls[0].init.headers).get("content-type")).toBe("application/json");
    expect(buildUrl(BASE, "/api/v1/admin/users/{id}", { id: "a/b?c" })).toBe(`${BASE}/api/v1/admin/users/a%2Fb%3Fc`);
    expect(() => buildUrl(BASE, "/api/v1/admin/users/{id}", {})).toThrow('Missing path parameter "id"');
  });

  it("returns no data for 204 answers", async () => {
    const { api } = setup([new Response(null, { status: 204 })]);
    expect(await api.delete("/api/v1/admin/users/{id}", { path: { id: USER_ID } })).toEqual({ ok: true, status: 204, data: undefined, meta: undefined });
  });

  it("refuses answers that aren't the contract's { data, meta }", async () => {
    const { api } = setup([json(200, [TRADER]), new Response("<html>ok</html>", { status: 200, headers: { "content-type": "text/html" } })]);
    for (let i = 0; i < 2; i += 1) {
      const result = await api.get("/api/v1/admin/roles");
      expect(!result.ok && result.error).toMatchObject({ code: "INVALID_RESPONSE", message: API_MESSAGES.INVALID_RESPONSE });
    }
  });
});

describe("error codes (ADM-09)", () => {
  const cases: [BackendErrorCode, number][] = [
    ["BAD_REQUEST", 400],
    ["VALIDATION_FAILED", 400],
    ["FORBIDDEN", 403],
    ["CONSENT_REQUIRED", 403],
    ["COUNTRY_RESTRICTED", 403],
    ["UNDER_AGE", 403],
    ["NOT_FOUND", 404],
    ["METHOD_NOT_ALLOWED", 405],
    ["PAYLOAD_TOO_LARGE", 413],
    ["UNSUPPORTED_MEDIA_TYPE", 415],
    ["UNPROCESSABLE_ENTITY", 422],
    ["LOCKED", 423],
    ["TOO_MANY_REQUESTS", 429],
    ["HTTP_ERROR", 418],
    ["INTERNAL_ERROR", 500],
  ];

  it.each(cases)("%s (%i) gets its clear message", async (code, status) => {
    const { api } = setup([errorReply(status, code)]);
    const result = await api.post("/api/v1/admin/programs", { body: { name: "2-Step", slug: "two-step", type: "TWO_STEP" } });
    expect(result).toEqual({ ok: false, error: { code, status, message: API_MESSAGES[code] } });
  });

  it("shows the backend's reason for conflicts (409 CONFLICT, RULE_SET_PUBLISHED)", async () => {
    const { api } = setup([errorReply(409, "CONFLICT", "The slug two-step is already used."), errorReply(409, "RULE_SET_PUBLISHED", "Rule set v3 is published.")]);
    const body = { name: "2-Step", slug: "two-step", type: "TWO_STEP" } as const;
    expect(await api.post("/api/v1/admin/programs", { body })).toMatchObject({ error: { code: "CONFLICT", message: "The slug two-step is already used." } });
    expect(await api.post("/api/v1/admin/programs", { body })).toMatchObject({ error: { code: "RULE_SET_PUBLISHED", message: "Rule set v3 is published." } });
  });

  it("keeps each field's message for VALIDATION_FAILED", async () => {
    const fields = { slug: "Use lowercase letters, numbers and dashes.", "phases.0.max_daily_loss_pct": "At most 100." };
    const { api } = setup([errorReply(400, "VALIDATION_FAILED", "Invalid input", fields)]);
    const result = await api.post("/api/v1/admin/programs", { body: { name: "2-Step", slug: "Two Step", type: "TWO_STEP" } });
    expect(result).toEqual({ ok: false, error: { code: "VALIDATION_FAILED", status: 400, message: API_MESSAGES.VALIDATION_FAILED, fields } });
  });

  it("falls back to the HTTP status for unknown codes and unreadable error answers", async () => {
    const { api } = setup([
      errorReply(409, "SOMETHING_NEWER", "Newer reason."),
      new Response("<html>Bad gateway</html>", { status: 502, headers: { "content-type": "text/html" } }),
    ]);
    expect(await api.post("/api/v1/admin/programs", { body: { name: "A", slug: "a", type: "TWO_STEP" } })).toMatchObject({ error: { code: "CONFLICT", message: "Newer reason." } });
    expect(await api.post("/api/v1/admin/programs", { body: { name: "A", slug: "a", type: "TWO_STEP" } })).toMatchObject({ error: { code: "SERVICE_UNAVAILABLE", status: 502 } });
  });
});

describe("the login token (ADM-09)", () => {
  it("doesn't call the backend without a session, and ends the session", async () => {
    const { api, calls, onSessionEnded } = setup([], { getAccessToken: async () => ({ error: "ended" }) });
    expect(await api.get("/api/v1/admin/roles")).toEqual({ ok: false, error: { code: "SESSION_ENDED", status: 401, message: API_MESSAGES.SESSION_ENDED } });
    expect(calls).toHaveLength(0);
    expect(onSessionEnded).toHaveBeenCalledOnce();
  });

  it("doesn't sign out when Supabase can't be reached for the token", async () => {
    const { api, calls, onSessionEnded } = setup([], { getAccessToken: async () => ({ error: "unavailable" }) });
    expect(await api.get("/api/v1/admin/roles")).toMatchObject({ ok: false, error: { code: "NETWORK_ERROR" } });
    expect(calls).toHaveLength(0);
    expect(onSessionEnded).not.toHaveBeenCalled();
  });

  it("401: renews the session once and sends the call again with the new token", async () => {
    const { api, calls, onSessionEnded } = setup([errorReply(401, "UNAUTHORIZED"), listPage([TRADER])]);
    expect(await api.get("/api/v1/admin/traders")).toMatchObject({ ok: true, data: [TRADER] });
    expect(calls.map((call) => call.authorization)).toEqual(["Bearer token-1", "Bearer token-2"]);
    expect(onSessionEnded).not.toHaveBeenCalled();
  });

  it("401 again after renewing, or a renewal that fails: the session has ended", async () => {
    const twice = setup([errorReply(401, "UNAUTHORIZED"), errorReply(401, "UNAUTHORIZED")]);
    expect(await twice.api.get("/api/v1/admin/roles")).toMatchObject({ error: { code: "SESSION_ENDED" } });
    expect(twice.onSessionEnded).toHaveBeenCalledOnce();

    const refused = setup([errorReply(401, "UNAUTHORIZED")], { refreshAccessToken: async (): Promise<TokenResult> => ({ error: "ended" }) });
    expect(await refused.api.get("/api/v1/admin/roles")).toMatchObject({ error: { code: "SESSION_ENDED" } });
    expect(refused.onSessionEnded).toHaveBeenCalledOnce();

    const offline = setup([errorReply(401, "UNAUTHORIZED")], { refreshAccessToken: async (): Promise<TokenResult> => ({ error: "unavailable" }) });
    expect(await offline.api.get("/api/v1/admin/roles")).toMatchObject({ error: { code: "NETWORK_ERROR" } });
    expect(offline.onSessionEnded).not.toHaveBeenCalled();
  });

  it("MFA_REQUIRED: asks for the 2FA code, then sends the call again", async () => {
    let token = "aal1-token";
    const onMfaRequired = vi.fn(async () => {
      token = "aal2-token";
      return true;
    });
    const { api, calls } = setup([errorReply(403, "MFA_REQUIRED"), listPage([])], { getAccessToken: async () => ({ token }), onMfaRequired });
    expect(await api.get("/api/v1/admin/traders")).toMatchObject({ ok: true, data: [] });
    expect(onMfaRequired).toHaveBeenCalledOnce();
    expect(calls.map((call) => call.authorization)).toEqual(["Bearer aal1-token", "Bearer aal2-token"]);
  });

  it("MFA_REQUIRED and the code isn't entered: returns the error, no second try", async () => {
    const cancelled = setup([errorReply(403, "MFA_REQUIRED")], { onMfaRequired: async () => false });
    expect(await cancelled.api.get("/api/v1/admin/roles")).toMatchObject({ error: { code: "MFA_REQUIRED", message: API_MESSAGES.MFA_REQUIRED } });
    expect(cancelled.calls).toHaveLength(1);
  });
});

describe("timeouts and safe retries (ADM-09)", () => {
  it("retries a read that failed on the way 2 times, waiting longer each time", async () => {
    const { api, calls, sleeps } = setup([new TypeError("Failed to fetch"), new TypeError("Failed to fetch"), new TypeError("Failed to fetch")]);
    expect(await api.get("/api/v1/admin/roles")).toEqual({ ok: false, error: { code: "NETWORK_ERROR", status: 0, message: API_MESSAGES.NETWORK_ERROR } });
    expect(calls).toHaveLength(3);
    expect(sleeps).toEqual([300, 600]);
  });

  it("a busy backend (503) gets another try for reads", async () => {
    const { api, calls } = setup([errorReply(503, "SERVICE_UNAVAILABLE"), listPage([TRADER])]);
    expect(await api.get("/api/v1/admin/traders")).toMatchObject({ ok: true });
    expect(calls).toHaveLength(2);
  });

  it("never retries writes automatically", async () => {
    const body = { name: "A", slug: "a", type: "TWO_STEP" } as const;
    const network = setup([new TypeError("Failed to fetch")]);
    expect(await network.api.post("/api/v1/admin/programs", { body })).toMatchObject({ error: { code: "NETWORK_ERROR" } });
    expect(network.calls).toHaveLength(1);
    const busy = setup([errorReply(503, "SERVICE_UNAVAILABLE")]);
    expect(await busy.api.post("/api/v1/admin/programs", { body })).toMatchObject({ error: { code: "SERVICE_UNAVAILABLE" } });
    expect(busy.calls).toHaveLength(1);
  });

  it("gives up after the timeout", async () => {
    const hang = (init: RequestInit) =>
      new Promise<Response>((_, reject) => init.signal?.addEventListener("abort", () => reject(new DOMException("Timed out", "TimeoutError"))));
    const { api } = setup([hang], { timeoutMs: 20, readRetries: 0 });
    expect(await api.get("/api/v1/admin/roles")).toMatchObject({ ok: false, error: { code: "TIMEOUT", message: API_MESSAGES.TIMEOUT } });
  });

  it("stops when the page cancels the call, without retrying", async () => {
    const controller = new AbortController();
    const cancelled = (init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        controller.abort();
      });
    const { api, calls } = setup([cancelled]);
    expect(await api.get("/api/v1/admin/roles", { signal: controller.signal })).toMatchObject({ ok: false, error: { code: "ABORTED" } });
    expect(calls).toHaveLength(1);
  });
});
