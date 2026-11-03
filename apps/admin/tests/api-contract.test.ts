import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { API_MESSAGES, type ClientErrorCode } from "../src/lib/api/errors";
import type { AdminApi } from "../src/lib/api/client";

type Contract = {
  info: { version: string };
  paths: Record<string, Record<string, { operationId?: string }>>;
  components: { schemas: { ErrorCode: { enum: string[] } } };
};

const contract = JSON.parse(readFileSync(new URL("../contract/openapi.json", import.meta.url), "utf8")) as Contract;
const METHODS = ["get", "post", "put", "patch", "delete"];

describe("API contract copy (ADM-08)", () => {
  it("is the backend contract v1.1.0 with all 35 admin operations", () => {
    expect(contract.info.version).toBe("1.1.0");
    const adminOperations = Object.entries(contract.paths)
      .filter(([path]) => path.startsWith("/api/v1/admin/"))
      .flatMap(([, item]) => METHODS.filter((method) => item[method]).map((method) => item[method].operationId));
    expect(adminOperations).toHaveLength(35);
    expect(new Set(adminOperations).size).toBe(35);
  });

  it("has a message for every backend error code, and no codes the backend doesn't send", () => {
    const clientCodes: ClientErrorCode[] = ["NETWORK_ERROR", "TIMEOUT", "ABORTED", "INVALID_RESPONSE", "SESSION_ENDED"];
    const ours = Object.keys(API_MESSAGES).filter((code) => !clientCodes.includes(code as ClientErrorCode));
    expect(ours.sort()).toEqual([...contract.components.schemas.ErrorCode.enum].sort());
  });
});

/**
 * Compile-time checks, run by the type check (`bun run typecheck`), never called at runtime.
 * Each @ts-expect-error line must stay an error: if the types stop catching it, the type check fails.
 */
export function typeChecks(api: AdminApi) {
  void api.get("/api/v1/admin/traders", { query: { q: "jane", status: "ACTIVE", limit: 20 } });
  void api.get("/api/v1/admin/roles");
  void api.get("/api/v1/admin/users/{id}", { path: { id: "4528cf78-d97e-4440-aae5-a98f1bf1b9ec" } });
  void api.put("/api/v1/admin/settings/{key}", { path: { key: "platform_name" }, body: { value: "Funded HUB" } });
  void api.delete("/api/v1/admin/users/{id}", { path: { id: "4528cf78-d97e-4440-aae5-a98f1bf1b9ec" } });

  // @ts-expect-error: not a status the contract allows
  void api.get("/api/v1/admin/traders", { query: { status: "BANNED" } });
  // @ts-expect-error: the user ID is required
  void api.get("/api/v1/admin/users/{id}");
  // @ts-expect-error: a GET has no body
  void api.get("/api/v1/admin/roles", { body: {} });
  // @ts-expect-error: publishing is a POST, not a GET
  void api.get("/api/v1/admin/rule-sets/{rule_set_id}/publish", { path: { rule_set_id: "x" } });
  // @ts-expect-error: no such route
  void api.get("/api/v1/admin/everything");

  return async () => {
    const result = await api.get("/api/v1/admin/traders");
    if (result.ok) {
      const email: string = result.data[0].email;
      const next: string | null = result.meta.next_cursor;
      return [email, next];
    }
    return result.error.code;
  };
}
