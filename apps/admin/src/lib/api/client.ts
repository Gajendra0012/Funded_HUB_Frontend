/**
 * The one way the admin app calls the backend (ADM-09). Every call:
 *  - carries the admin's 2FA (aal2) Supabase token as `Authorization: Bearer …`, and never cookies
 *  - gives up after a timeout (15 s by default)
 *  - returns a result ({ ok: true, data, meta } or { ok: false, error }) instead of throwing
 *
 * Recovery, each at most once per call (all three are refused before the backend changes anything,
 * so sending the call again is safe):
 *  - 401: renew the session, then send again; if that fails, the session has ended
 *  - 403 MFA_REQUIRED: ask for the 2FA code, then send again
 *  - reads (GET) that fail on the way (no connection, timeout, 503): try again up to 2 times, waiting a
 *    little longer each time. Writes are never retried automatically.
 */
import { apiError, parseErrorBody, type ApiError } from "./errors";
import type { ApiFailure, ApiResult, HttpMethod, Operation, OptionsArg, PathWith, RequestOptions, ResultOf } from "./types";

/** A token, or why there isn't one: the session has "ended", or Supabase is "unavailable" right now. */
export type TokenResult = { token: string } | { error: "ended" | "unavailable" };

export type AdminApiConfig = {
  /** Backend address without a trailing slash, e.g. http://127.0.0.1:4000. */
  baseUrl: string;
  getAccessToken: () => Promise<TokenResult>;
  refreshAccessToken: () => Promise<TokenResult>;
  /** The session can't be used any more: sign out and show the login page. */
  onSessionEnded?: () => void;
  /** Ask the admin for their 2FA code; resolves true once the session is aal2 again. */
  onMfaRequired?: () => Promise<boolean>;
  timeoutMs?: number;
  readRetries?: number;
  /** Replaceable in tests. */
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
};

type AnyOptions = { signal?: AbortSignal; path?: Record<string, unknown>; query?: Record<string, unknown>; body?: unknown };

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_READ_RETRIES = 2;
const BACKOFF_BASE_MS = 400;

const fail = (error: ApiError): ApiFailure => ({ ok: false, error });

/** Fills `{id}` placeholders and adds the query, skipping empty values (the contract refuses empty strings). */
export function buildUrl(baseUrl: string, path: string, pathParams?: Record<string, unknown>, query?: Record<string, unknown>): string {
  const filled = path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = pathParams?.[name];
    // The types make this impossible; reaching it is a bug, so it throws.
    if (value === undefined || value === null || value === "") throw new Error(`Missing path parameter "${name}" for ${path}`);
    return encodeURIComponent(String(value));
  });
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const queryString = search.toString();
  return `${baseUrl}${filled}${queryString ? `?${queryString}` : ""}`;
}

function isEnvelope(value: unknown): value is { data: unknown; meta: unknown } {
  if (typeof value !== "object" || value === null || !("data" in value) || !("meta" in value)) return false;
  return typeof value.meta === "object" && value.meta !== null;
}

async function readJson(response: Response): Promise<{ ok: true; value: unknown } | { ok: false }> {
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) return { ok: false };
  try {
    return { ok: true, value: await response.json() };
  } catch {
    return { ok: false };
  }
}

async function toResult(response: Response): Promise<ApiResult<unknown, unknown>> {
  if (response.status === 204) return { ok: true, status: 204, data: undefined, meta: undefined };
  const body = await readJson(response);
  if (response.ok) {
    if (!body.ok || !isEnvelope(body.value)) return fail(apiError("INVALID_RESPONSE", response.status));
    return { ok: true, status: response.status, data: body.value.data, meta: body.value.meta };
  }
  return fail(parseErrorBody(response.status, body.ok ? body.value : undefined));
}

export function createAdminApi(config: AdminApiConfig) {
  const fetchImpl = config.fetch ?? fetch;
  const sleep = config.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const random = config.random ?? Math.random;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const readRetries = config.readRetries ?? DEFAULT_READ_RETRIES;

  function tokenFailure(result: Exclude<TokenResult, { token: string }>): ApiFailure {
    if (result.error === "unavailable") return fail(apiError("NETWORK_ERROR", 0));
    config.onSessionEnded?.();
    return fail(apiError("SESSION_ENDED", 401));
  }

  /** One HTTP attempt. Failures without an answer become NETWORK_ERROR, TIMEOUT or ABORTED. */
  async function attempt(method: HttpMethod, url: string, token: string, options: AnyOptions): Promise<Response | ApiFailure> {
    const timeout = AbortSignal.timeout(timeoutMs);
    try {
      return await fetchImpl(url, {
        method: method.toUpperCase(),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout,
        credentials: "omit",
        cache: "no-store",
        // The API never redirects; following one could send the request somewhere unexpected.
        redirect: "error",
      });
    } catch {
      if (options.signal?.aborted) return fail(apiError("ABORTED", 0));
      return fail(apiError(timeout.aborted ? "TIMEOUT" : "NETWORK_ERROR", 0));
    }
  }

  /** Waits before the next read attempt: 200–400 ms, then 400–800 ms (exponential backoff with jitter). */
  function backoff(retry: number): Promise<void> {
    const ceiling = BACKOFF_BASE_MS * 2 ** retry;
    return sleep(ceiling / 2 + random() * (ceiling / 2));
  }

  async function request(method: HttpMethod, path: string, options: AnyOptions = {}): Promise<ApiResult<unknown, unknown>> {
    const url = buildUrl(config.baseUrl, path, options.path, options.query);
    const first = await config.getAccessToken();
    if (!("token" in first)) return tokenFailure(first);
    let token = first.token;
    let renewed = false;
    let steppedUp = false;
    let retries = 0;

    for (;;) {
      const outcome = await attempt(method, url, token, options);
      const result = outcome instanceof Response ? await toResult(outcome) : outcome;
      if (result.ok) return result;
      const { code } = result.error;

      if (code === "UNAUTHORIZED") {
        if (renewed) {
          config.onSessionEnded?.();
          return fail(apiError("SESSION_ENDED", 401));
        }
        renewed = true;
        const fresh = await config.refreshAccessToken();
        if (!("token" in fresh)) return tokenFailure(fresh);
        token = fresh.token;
        continue;
      }

      if (code === "MFA_REQUIRED" && !steppedUp && config.onMfaRequired) {
        steppedUp = true;
        if (!(await config.onMfaRequired())) return result;
        const next = await config.getAccessToken();
        if (!("token" in next)) return tokenFailure(next);
        token = next.token;
        continue;
      }

      const temporary = code === "NETWORK_ERROR" || code === "TIMEOUT" || code === "SERVICE_UNAVAILABLE";
      if (method === "get" && temporary && retries < readRetries) {
        await backoff(retries);
        retries += 1;
        if (options.signal?.aborted) return fail(apiError("ABORTED", 0));
        continue;
      }
      return result;
    }
  }

  // The data is trusted to match the contract: the backend sends every answer through its response schema.
  return {
    get: <P extends PathWith<"get">>(path: P, ...[options]: OptionsArg<RequestOptions<Operation<P, "get">>>) =>
      request("get", path, options as AnyOptions) as Promise<ResultOf<P, "get">>,
    post: <P extends PathWith<"post">>(path: P, ...[options]: OptionsArg<RequestOptions<Operation<P, "post">>>) =>
      request("post", path, options as AnyOptions) as Promise<ResultOf<P, "post">>,
    put: <P extends PathWith<"put">>(path: P, ...[options]: OptionsArg<RequestOptions<Operation<P, "put">>>) =>
      request("put", path, options as AnyOptions) as Promise<ResultOf<P, "put">>,
    patch: <P extends PathWith<"patch">>(path: P, ...[options]: OptionsArg<RequestOptions<Operation<P, "patch">>>) =>
      request("patch", path, options as AnyOptions) as Promise<ResultOf<P, "patch">>,
    delete: <P extends PathWith<"delete">>(path: P, ...[options]: OptionsArg<RequestOptions<Operation<P, "delete">>>) =>
      request("delete", path, options as AnyOptions) as Promise<ResultOf<P, "delete">>,
  };
}

export type AdminApi = ReturnType<typeof createAdminApi>;
