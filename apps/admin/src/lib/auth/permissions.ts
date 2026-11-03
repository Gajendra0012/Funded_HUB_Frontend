/**
 * The 18 admin permission codes (ADM-05), in the backend's order, with the backend's own descriptions
 * (supabase/seed.sql). The backend checks them on every call. The admin app uses this one list to lay
 * out the roles matrix and, after gap G1, to hide what an admin can't use (ADM-18).
 *
 * tests/permissions.test.ts keeps it equal to the backend's list (contract/permissions.json).
 */
export const PERMISSIONS = [
  { code: "traders.read", label: "View trader profiles and accounts" },
  { code: "traders.update", label: "Edit trader profiles, lock or close accounts" },
  { code: "kyc.review", label: "Approve or reject KYC applications" },
  { code: "programs.manage", label: "Create and edit programs, sizes and add-ons" },
  { code: "rules.publish", label: "Publish new rule set versions" },
  { code: "instruments.manage", label: "Enable pairs and set leverage caps" },
  { code: "risk.action", label: "Fail, suspend or adjust trading accounts" },
  { code: "risk.review", label: "Approve pass reviews and resolve abuse flags" },
  { code: "orders.read", label: "View orders and payments" },
  { code: "refunds.create", label: "Issue refunds" },
  { code: "payouts.approve", label: "Approve or reject payout requests" },
  { code: "payouts.send", label: "Send approved payouts" },
  { code: "affiliates.manage", label: "Manage affiliates and commission plans" },
  { code: "discounts.manage", label: "Create and edit discount codes" },
  { code: "notifications.manage", label: "Edit notification templates" },
  { code: "settings.manage", label: "Change system settings" },
  { code: "admins.manage", label: "Add admin members and assign roles" },
  { code: "audit.read", label: "Read the audit log" },
] as const satisfies readonly { code: string; label: string }[];

export type PermissionCode = (typeof PERMISSIONS)[number]["code"];

export const PERMISSION_CODES: readonly PermissionCode[] = PERMISSIONS.map((permission) => permission.code);

export function isPermissionCode(value: string): value is PermissionCode {
  return (PERMISSION_CODES as readonly string[]).includes(value);
}
