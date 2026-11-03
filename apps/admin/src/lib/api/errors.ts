/**
 * Backend errors as clear messages (ADM-09).
 *
 * The backend answers every error with { error: { code, message, fields? } } and a code from one
 * catalogue (contract ErrorCode). Each code gets one message here. The backend's own message is shown
 * only where it says *why* (conflicts); field messages go next to their fields.
 */
import type { components } from "./schema";

export type BackendErrorCode = components["schemas"]["ErrorCode"];

/** Failures that never got a readable answer from the backend. */
export type ClientErrorCode = "NETWORK_ERROR" | "TIMEOUT" | "ABORTED" | "INVALID_RESPONSE" | "SESSION_ENDED";

export type ApiErrorCode = BackendErrorCode | ClientErrorCode;

export type ApiError = {
  code: ApiErrorCode;
  /** HTTP status, or 0 when there was no answer. */
  status: number;
  /** Safe to show. */
  message: string;
  /** VALIDATION_FAILED only: field (dotted path for nested fields) → message. */
  fields?: Record<string, string>;
};

export const API_MESSAGES: Record<ApiErrorCode, string> = {
  BAD_REQUEST: "The request couldn't be read. Refresh the page and try again.",
  VALIDATION_FAILED: "Some details need fixing. Check the highlighted fields.",
  UNAUTHORIZED: "Your session has ended. Please sign in again.",
  FORBIDDEN: "You don't have permission for this.",
  MFA_REQUIRED: "Enter your 2FA code to continue.",
  CONSENT_REQUIRED: "This account must accept the current terms first.",
  COUNTRY_RESTRICTED: "This isn't available in the account's country.",
  UNDER_AGE: "This isn't available for the account's age.",
  NOT_FOUND: "We couldn't find this. It may have been removed.",
  METHOD_NOT_ALLOWED: "This action isn't available.",
  CONFLICT: "This change conflicts with the current state. Refresh and try again.",
  RULE_SET_PUBLISHED: "This rule set is published and can't change. Create a new version instead.",
  PAYLOAD_TOO_LARGE: "That's too much data to send at once.",
  UNSUPPORTED_MEDIA_TYPE: "The request was sent in the wrong format. Refresh the page and try again.",
  UNPROCESSABLE_ENTITY: "The request couldn't be processed. Check the details and try again.",
  LOCKED: "This is locked right now. Try again later.",
  TOO_MANY_REQUESTS: "Too many tries. Wait a moment, then try again.",
  HTTP_ERROR: "Something went wrong with this request. Try again.",
  INTERNAL_ERROR: "Something went wrong on our side. Try again.",
  SERVICE_UNAVAILABLE: "The service is busy. Try again in a moment.",
  NETWORK_ERROR: "Can't reach the admin service. Check your connection and try again.",
  TIMEOUT: "The admin service took too long to answer. Try again.",
  ABORTED: "The request was cancelled.",
  INVALID_RESPONSE: "The admin service sent an unexpected answer. Try again.",
  SESSION_ENDED: "Your session has ended. Please sign in again.",
};

/** Codes whose backend message says why (e.g. "slug already used"), so it's shown instead of ours. */
const SHOW_BACKEND_MESSAGE = new Set<ApiErrorCode>(["CONFLICT", "RULE_SET_PUBLISHED"]);

const BACKEND_CODES = new Set<string>(Object.keys(API_MESSAGES).filter((code) => !isClientCode(code)));

function isClientCode(code: string): code is ClientErrorCode {
  return ["NETWORK_ERROR", "TIMEOUT", "ABORTED", "INVALID_RESPONSE", "SESSION_ENDED"].includes(code);
}

export function apiError(code: ApiErrorCode, status: number, backendMessage?: string, fields?: Record<string, string>): ApiError {
  const message = SHOW_BACKEND_MESSAGE.has(code) && backendMessage ? backendMessage : API_MESSAGES[code];
  return fields ? { code, status, message, fields } : { code, status, message };
}

/** The code for a status when the body has no known code (a newer backend code, or no JSON at all). */
export function codeForStatus(status: number): BackendErrorCode {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 405) return "METHOD_NOT_ALLOWED";
  if (status === 409) return "CONFLICT";
  if (status === 413) return "PAYLOAD_TOO_LARGE";
  if (status === 415) return "UNSUPPORTED_MEDIA_TYPE";
  if (status === 422) return "UNPROCESSABLE_ENTITY";
  if (status === 423) return "LOCKED";
  if (status === 429) return "TOO_MANY_REQUESTS";
  // 502/504 come from a proxy in front of the backend: as temporary as the backend's own 503.
  if (status === 502 || status === 503 || status === 504) return "SERVICE_UNAVAILABLE";
  if (status >= 500) return "INTERNAL_ERROR";
  return "HTTP_ERROR";
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.values(value).every((v) => typeof v === "string");
}

/** Reads an error answer. Anything that doesn't match the contract falls back to the HTTP status. */
export function parseErrorBody(status: number, body: unknown): ApiError {
  const error = typeof body === "object" && body !== null ? (body as { error?: unknown }).error : undefined;
  if (typeof error !== "object" || error === null) return apiError(codeForStatus(status), status);
  const { code, message, fields } = error as { code?: unknown; message?: unknown; fields?: unknown };
  const known = typeof code === "string" && BACKEND_CODES.has(code) ? (code as BackendErrorCode) : codeForStatus(status);
  return apiError(known, status, typeof message === "string" ? message : undefined, known === "VALIDATION_FAILED" && isStringRecord(fields) ? fields : undefined);
}

/** No readable answer came back, so a change may or may not have been saved: show the list again before retrying. */
export function outcomeUnknown(error: ApiError): boolean {
  return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT" || error.code === "INVALID_RESPONSE";
}

/** Errors worth a "Try again" button: the same request may work a moment later. */
export function isRetryable(error: ApiError): boolean {
  return ["NETWORK_ERROR", "TIMEOUT", "INVALID_RESPONSE", "TOO_MANY_REQUESTS", "INTERNAL_ERROR", "SERVICE_UNAVAILABLE", "HTTP_ERROR"].includes(error.code);
}
