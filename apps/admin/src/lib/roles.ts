import { PERMISSIONS, isPermissionCode } from "./auth/permissions";
import type { Schemas } from "./api/types";

/** A role from `GET /admin/roles`: seeded by the backend, read only. */
export type StaffRole = Schemas["StaffRole"];

/** The backend's 4 roles, in the order the admin app shows them. */
export const ROLE_ORDER = ["ADMIN", "RISK", "SUPPORT", "FINANCE"] as const;

function roleRank(code: string): number {
  const index = (ROLE_ORDER as readonly string[]).indexOf(code);
  return index === -1 ? ROLE_ORDER.length : index;
}

/** Roles in the app's order. The API returns them in ID order; a role the app doesn't know goes last. */
export function sortRoles<R extends { code: string }>(roles: readonly R[]): R[] {
  return [...roles].sort((a, b) => roleRank(a.code) - roleRank(b.code) || a.code.localeCompare(b.code));
}

export type RoleMatrixRow = {
  code: string;
  label: string;
  /** False for a code the backend has and this app's list doesn't: the list needs updating. */
  known: boolean;
  /** One entry per role, in `roles` order. */
  granted: boolean[];
};

export type RoleMatrix = { roles: StaffRole[]; rows: RoleMatrixRow[]; unknownCodes: string[] };

/**
 * The roles matrix (ADM-05): one row per permission, in the app's order, one column per role.
 * Nothing is hidden: codes the app doesn't know yet get their own rows at the end.
 */
export function buildRoleMatrix(roles: readonly StaffRole[]): RoleMatrix {
  const sorted = sortRoles(roles);
  const unknownCodes = [...new Set(sorted.flatMap((role) => role.permissions))].filter((code) => !isPermissionCode(code)).sort();
  const rows = [
    ...PERMISSIONS.map((permission) => ({ code: permission.code, label: permission.label, known: true })),
    ...unknownCodes.map((code) => ({ code, label: code, known: false })),
  ].map((row) => ({ ...row, granted: sorted.map((role) => role.permissions.includes(row.code)) }));
  return { roles: sorted, rows, unknownCodes };
}
