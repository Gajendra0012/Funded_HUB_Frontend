import { describe, expect, it } from "vitest";
import {
  filterByStatus,
  lastLoginText,
  memberActionMessage,
  personLabel,
  personName,
  roleNames,
  sameIds,
  sortMembers,
  type StaffMember,
} from "../src/lib/admin-users";
import { API_MESSAGES, apiError, outcomeUnknown, parseErrorBody } from "../src/lib/api/errors";
import { isLivePath } from "../src/lib/live-pages";
import type { StaffRole } from "../src/lib/roles";

const ROLE: Record<string, StaffRole> = {
  ADMIN: { id: "r-admin", code: "ADMIN", name: "Admin", description: null, permissions: [] },
  RISK: { id: "r-risk", code: "RISK", name: "Risk", description: null, permissions: [] },
  SUPPORT: { id: "r-support", code: "SUPPORT", name: "Support", description: null, permissions: [] },
  FINANCE: { id: "r-finance", code: "FINANCE", name: "Finance", description: null, permissions: [] },
};
function member(email: string, overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: `m-${email}`,
    profile_id: `p-${email}`,
    email,
    first_name: null,
    last_name: null,
    status: "ACTIVE",
    require_2fa: true,
    two_factor_enrolled: true,
    last_login_at: null,
    roles: [ROLE.ADMIN],
    created_at: "2026-11-03T08:00:00Z",
    updated_at: "2026-11-03T08:00:00Z",
    ...overrides,
  };
}
// The backend's own refusals (src/api/admin/admin-foundation.service.ts), as the API helper reads them.
const refusal = (message: string) => parseErrorBody(409, { error: { code: "CONFLICT", message } });

describe("admin users: names and rows (ADM-34)", () => {
  it("names a person by first and last name, or by email when there's none", () => {
    expect(personName({ first_name: " Asha ", last_name: "Rao" })).toBe("Asha Rao");
    expect(personName({ first_name: null, last_name: "Rao" })).toBe("Rao");
    expect(personLabel({ first_name: null, last_name: "  ", email: "ops@example.com" })).toBe("ops@example.com");
  });

  it("sorts rows by name, then email (the API returns them in ID order)", () => {
    const rows = [member("zed@example.com", { first_name: "Zed" }), member("b@example.com"), member("amy@example.com", { first_name: "Amy" })];
    expect(sortMembers(rows).map((row) => row.email)).toEqual(["amy@example.com", "b@example.com", "zed@example.com"]);
  });

  it("filters the loaded rows by status (the API has no status filter, gap G11)", () => {
    const rows = [member("a@example.com"), member("b@example.com", { status: "DISABLED" })];
    expect(filterByStatus(rows, "").map((row) => row.email)).toEqual(["a@example.com", "b@example.com"]);
    expect(filterByStatus(rows, "DISABLED").map((row) => row.email)).toEqual(["b@example.com"]);
    expect(filterByStatus(rows, "ACTIVE").map((row) => row.email)).toEqual(["a@example.com"]);
  });

  it("lists roles in the app's order, whatever order the API sends", () => {
    expect(roleNames(member("a@example.com", { roles: [ROLE.FINANCE, ROLE.ADMIN, ROLE.SUPPORT] }))).toEqual(["Admin", "Support", "Finance"]);
  });

  it("compares role choices as sets", () => {
    expect(sameIds(["a", "b"], ["b", "a"])).toBe(true);
    expect(sameIds(["a"], ["a", "b"])).toBe(false);
    expect(sameIds(["a", "b"], ["a", "c"])).toBe(false);
  });

  it("says 'Not recorded' for an empty last login: the backend doesn't record admin sign-ins yet (gap G12)", () => {
    expect(lastLoginText(member("a@example.com"))).toBe("Not recorded");
    expect(lastLoginText(member("a@example.com", { last_login_at: "2026-11-03T09:05:00Z" }))).toBe("3 Nov 2026, 09:05:00 UTC");
  });
});

describe("admin users: refusals and failures (ADM-34)", () => {
  it("shows the backend's reason when it refuses a change to your own access or to the last Admin", () => {
    const self = refusal("Use another administrator to change your roles or disable your membership.");
    const last = refusal("At least one active Admin must remain.");
    for (const action of ["roles", "disable", "enable"] as const) {
      expect(memberActionMessage(action, self)).toBe("Use another administrator to change your roles or disable your membership.");
      expect(memberActionMessage(action, last)).toBe("At least one active Admin must remain.");
    }
  });

  it("explains a conflict when adding: the account is already an admin", () => {
    expect(memberActionMessage("add", refusal("A record with these unique values already exists."))).toBe(
      "This account is already an admin. Find it in the list instead.",
    );
  });

  it("explains 'not found' for adding and for changing", () => {
    const missing = apiError("NOT_FOUND", 404);
    expect(memberActionMessage("add", missing)).toContain("isn't active");
    expect(memberActionMessage("roles", missing)).toContain("no longer exists");
  });

  it("warns that a change may already be saved when no answer came back, and reloads the list", () => {
    for (const code of ["NETWORK_ERROR", "TIMEOUT", "INVALID_RESPONSE"] as const) {
      const error = apiError(code, 0);
      expect(outcomeUnknown(error), code).toBe(true);
      expect(memberActionMessage("disable", error)).toBe(`${API_MESSAGES[code]} Check the list before trying again: the change may already be saved.`);
    }
    for (const code of ["SERVICE_UNAVAILABLE", "FORBIDDEN", "VALIDATION_FAILED"] as const) expect(outcomeUnknown(apiError(code, 503)), code).toBe(false);
  });

  it("uses the shared message for anything else", () => {
    expect(memberActionMessage("roles", apiError("FORBIDDEN", 403))).toBe(API_MESSAGES.FORBIDDEN);
    expect(memberActionMessage("add", apiError("SERVICE_UNAVAILABLE", 503))).toBe(API_MESSAGES.SERVICE_UNAVAILABLE);
  });
});

describe("live pages", () => {
  it("labels the connected pages as live (AO-4 roles and admin users, AO-5 audit log, AO-6 settings); the rest stay sample", () => {
    for (const path of ["/roles", "/admin-users", "/users", "/audit-log", "/audit", "/settings"]) expect(isLivePath(path), path).toBe(true);
    for (const path of ["/", "/traders", "/programs", "/roles/extra"]) expect(isLivePath(path), path).toBe(false);
  });
});
