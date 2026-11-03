import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RoleMatrixView } from "../src/components/roles-screen";
import { PERMISSION_CODES, PERMISSIONS, isPermissionCode } from "../src/lib/auth/permissions";
import { buildRoleMatrix, sortRoles, type StaffRole } from "../src/lib/roles";

const backendList = JSON.parse(readFileSync(new URL("../contract/permissions.json", import.meta.url), "utf8")) as { codes: string[] };
const contract = JSON.parse(readFileSync(new URL("../contract/openapi.json", import.meta.url), "utf8")) as {
  paths: Record<string, Record<string, { "x-required-permission"?: string }>>;
};

// The backend's seed (supabase/seed.sql): ADMIN has every permission, the others a subset.
const SEED: Record<string, string[]> = {
  ADMIN: [...PERMISSION_CODES],
  RISK: ["traders.read", "risk.action", "risk.review", "instruments.manage", "audit.read"],
  SUPPORT: ["traders.read", "traders.update", "kyc.review", "orders.read"],
  FINANCE: ["traders.read", "orders.read", "refunds.create", "payouts.approve", "payouts.send", "affiliates.manage", "discounts.manage", "audit.read"],
};
const role = (code: string, id: string, permissions = SEED[code] ?? []): StaffRole => ({
  id,
  code,
  name: code.charAt(0) + code.slice(1).toLowerCase(),
  description: `${code} description`,
  permissions: [...permissions].sort(),
});
// The API returns roles in ID order, which isn't the app's order.
const apiRoles = [role("SUPPORT", "1"), role("FINANCE", "2"), role("ADMIN", "3"), role("RISK", "4")];

describe("the permission list (ADM-05)", () => {
  it("is exactly the backend's 18 codes, in the backend's order", () => {
    expect(PERMISSION_CODES).toEqual(backendList.codes);
    expect(new Set(PERMISSION_CODES).size).toBe(18);
    expect(PERMISSIONS.every((permission) => permission.label.length > 0)).toBe(true);
  });

  it("knows every permission the contract's admin routes require", () => {
    const required = Object.values(contract.paths).flatMap((item) => Object.values(item).map((operation) => operation["x-required-permission"]));
    const codes = [...new Set(required.filter((code): code is string => typeof code === "string"))];
    expect(codes.length).toBeGreaterThan(0);
    for (const code of codes) expect(isPermissionCode(code), code).toBe(true);
  });
});

describe("the roles matrix (ADM-05)", () => {
  it("shows the roles as Admin, Risk, Support, Finance; a role the app doesn't know goes last", () => {
    expect(sortRoles(apiRoles).map((r) => r.code)).toEqual(["ADMIN", "RISK", "SUPPORT", "FINANCE"]);
    expect(sortRoles([role("AUDITOR", "9", []), ...apiRoles]).map((r) => r.code)).toEqual(["ADMIN", "RISK", "SUPPORT", "FINANCE", "AUDITOR"]);
  });

  it("has one row per permission in the app's order, with each role's grants", () => {
    const matrix = buildRoleMatrix(apiRoles);
    expect(matrix.rows.map((row) => row.code)).toEqual([...PERMISSION_CODES]);
    expect(matrix.unknownCodes).toEqual([]);
    const grantsOf = (code: string) => matrix.rows.filter((row) => row.granted[matrix.roles.findIndex((r) => r.code === code)]).map((row) => row.code);
    expect(grantsOf("ADMIN")).toEqual([...PERMISSION_CODES]);
    for (const code of ["RISK", "SUPPORT", "FINANCE"]) expect(grantsOf(code).sort(), code).toEqual([...SEED[code]].sort());
  });

  it("hides nothing: a code the app doesn't know gets its own row at the end", () => {
    const matrix = buildRoleMatrix([role("ADMIN", "3", [...PERMISSION_CODES, "reports.export"]), role("RISK", "4")]);
    expect(matrix.unknownCodes).toEqual(["reports.export"]);
    expect(matrix.rows.at(-1)).toMatchObject({ code: "reports.export", known: false, granted: [true, false] });
  });

  it("renders the live roles, the 18 rows and screen-reader text for each mark", () => {
    const html = renderToStaticMarkup(<RoleMatrixView matrix={buildRoleMatrix(apiRoles)} />);
    expect(html.match(/data-testid="permission-row-/g)).toHaveLength(18);
    expect(html.match(/data-testid="role-card-/g)).toHaveLength(4);
    expect(html).toContain("18 of 18 permissions");
    expect(html).toContain("5 of 18 permissions");
    const granted = Object.values(SEED).reduce((sum, codes) => sum + codes.length, 0);
    expect(html.match(/data-granted="true"/g)).toHaveLength(granted);
    expect(html.match(/<span class="ui-sr">Granted<\/span>/g)).toHaveLength(granted);
    expect(html).not.toContain("roles-unknown");
  });

  it("warns when the backend has a permission the app doesn't know", () => {
    const html = renderToStaticMarkup(<RoleMatrixView matrix={buildRoleMatrix([role("ADMIN", "3", [...PERMISSION_CODES, "reports.export"])])} />);
    expect(html).toContain('data-testid="roles-unknown"');
    expect(html).toContain("reports.export");
  });
});
