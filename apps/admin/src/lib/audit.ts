/**
 * Audit log (ADM-35): the rules behind the screen, kept apart from it so they can be tested.
 *
 * Only the admin API writes audit entries (one per change, in the same database transaction). The
 * action is the API operation's ID, e.g. `disableAdminMember`; the record type is the table changed.
 */
import type { StaffMember } from "./admin-users";
import { personLabel } from "./admin-users";
import type { Schemas } from "./api/types";

export type AuditRecord = Schemas["AuditRecord"];

/** Entries per page. */
export const AUDIT_PAGE_SIZE = 50;

/**
 * Every action the admin API records: its write operations (tests/audit.test.tsx checks this list
 * against the contract). Grouped by area for the filter.
 */
export const AUDIT_ACTIONS = [
  { code: "createAdminMember", label: "Admin added", group: "Admins" },
  { code: "updateAdminMember", label: "Admin changed", group: "Admins" },
  { code: "disableAdminMember", label: "Admin disabled", group: "Admins" },
  { code: "updateAdminTrader", label: "Trader changed", group: "Traders" },
  { code: "updateAdminSetting", label: "Setting changed", group: "Settings" },
  { code: "createAdminProgram", label: "Program created", group: "Programs" },
  { code: "updateAdminProgram", label: "Program changed", group: "Programs" },
  { code: "createAdminProgramPhase", label: "Phase added", group: "Programs" },
  { code: "updateAdminProgramPhase", label: "Phase changed", group: "Programs" },
  { code: "deleteAdminProgramPhase", label: "Phase deleted", group: "Programs" },
  { code: "createAdminAccountSize", label: "Account size added", group: "Programs" },
  { code: "updateAdminAccountSize", label: "Account size changed", group: "Programs" },
  { code: "createAdminAddon", label: "Add-on added", group: "Programs" },
  { code: "updateAdminAddon", label: "Add-on changed", group: "Programs" },
  { code: "replaceAdminPayoutPolicy", label: "Payout policy set", group: "Programs" },
  { code: "deleteAdminPayoutPolicy", label: "Payout policy deleted", group: "Programs" },
  { code: "createAdminScalingMilestone", label: "Scaling step added", group: "Programs" },
  { code: "updateAdminScalingMilestone", label: "Scaling step changed", group: "Programs" },
  { code: "deleteAdminScalingMilestone", label: "Scaling step deleted", group: "Programs" },
  { code: "replaceAdminProgramInstruments", label: "Program pairs set", group: "Programs" },
  { code: "createAdminRuleSet", label: "Rule set created", group: "Rule sets" },
  { code: "updateAdminRuleSet", label: "Rule set changed", group: "Rule sets" },
  { code: "publishAdminRuleSet", label: "Rule set published", group: "Rule sets" },
] as const;

/** The record types (tables) the admin API changes, from the backend's admin services. */
export const AUDIT_ENTITY_TYPES = [
  { code: "admin_members", label: "Admin" },
  { code: "profiles", label: "Trader" },
  { code: "system_settings", label: "Setting" },
  { code: "programs", label: "Program" },
  { code: "program_phases", label: "Program phase" },
  { code: "account_sizes", label: "Account size" },
  { code: "program_addons", label: "Add-on" },
  { code: "payout_policies", label: "Payout policy" },
  { code: "scaling_milestones", label: "Scaling step" },
  { code: "program_instruments", label: "Program pairs" },
  { code: "rule_sets", label: "Rule set" },
] as const;

/** A JSON value as an object, for the before/after view (anything else is shown under `value`). */
export function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : { value };
}

/** The top-level fields that differ between before and after. */
export function changedKeys(before: unknown, after: unknown): string[] {
  const a = asRecord(before);
  const b = asRecord(after);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key])).sort();
}

/** The same fields with the changed ones first, so the change is in view without scrolling past the rest. */
export function changedFirst(data: Record<string, unknown>, changed: readonly string[]): Record<string, unknown> {
  const keys = Object.keys(data);
  return Object.fromEntries([...keys.filter((key) => changed.includes(key)), ...keys.filter((key) => !changed.includes(key))].map((key) => [key, data[key]]));
}

/** What happened, in words. An admin change says what changed: re-enabled, disabled or roles. */
export function actionLabel(entry: Pick<AuditRecord, "action" | "before_data" | "after_data">): string {
  if (entry.action === "updateAdminMember") {
    const before = asRecord(entry.before_data);
    const after = asRecord(entry.after_data);
    if (before.status !== after.status) return after.status === "ACTIVE" ? "Admin re-enabled" : "Admin disabled";
    // The backend lists roles in a fixed order (by code), so the same roles always compare equal.
    if (JSON.stringify(before.roles) !== JSON.stringify(after.roles)) return "Admin roles changed";
  }
  return AUDIT_ACTIONS.find((action) => action.code === entry.action)?.label ?? entry.action;
}

export function entityTypeLabel(code: string): string {
  return AUDIT_ENTITY_TYPES.find((type) => type.code === code)?.label ?? code;
}

/** "1a2b3c4d…": enough of an ID to tell entries apart in a table. */
export function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

/**
 * Which record changed, in words: from the entry itself (its email, name, setting key or code), so it
 * still reads well after the record is gone. Otherwise a short ID.
 */
export function recordName(entry: Pick<AuditRecord, "entity_id" | "before_data" | "after_data">): string {
  for (const data of [asRecord(entry.after_data), asRecord(entry.before_data)]) {
    for (const field of ["email", "name", "key", "code"]) {
      const value = data[field];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return entry.entity_id ? shortId(entry.entity_id) : "—";
}

/** Admin member ID → their name, from the admin list (only admins who may manage admins can load it, gap G6). */
export type ActorNames = Map<string, { name: string; email: string }>;

export function actorNames(members: readonly StaffMember[]): ActorNames {
  return new Map(members.map((member) => [member.id, { name: personLabel(member), email: member.email }]));
}

/** Who did it: an admin's name when known, otherwise the kind of actor and a short ID. */
export function actorLabel(entry: Pick<AuditRecord, "actor_type" | "actor_id">, names: ActorNames | null): string {
  if (entry.actor_type === "SYSTEM" || !entry.actor_id) return entry.actor_type === "SYSTEM" ? "System" : "Unknown";
  const known = names?.get(entry.actor_id);
  if (known) return known.name;
  return `${entry.actor_type === "ADMIN" ? "Admin" : "Trader"} ${shortId(entry.actor_id)}`;
}

/** IPv4 addresses arrive in IPv6 form ("::ffff:127.0.0.1"); people know them as "127.0.0.1". */
export function displayIp(ip: string | null): string {
  if (!ip) return "—";
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  return mapped ? mapped[1] : ip;
}

/** The API can't filter by IP (gap G6), so the screen filters the entries it has loaded. */
export function filterByIp(entries: readonly AuditRecord[], text: string): AuditRecord[] {
  const needle = text.trim().toLowerCase();
  if (!needle) return [...entries];
  return entries.filter((entry) => entry.ip !== null && (entry.ip.toLowerCase().includes(needle) || displayIp(entry.ip).includes(needle)));
}

// The contract's UUID rule (RFC 9562), so a bad ID is caught here instead of being refused by the API.
const UUID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value.trim());
}

/**
 * A date range picked as UTC days ("2026-11-03") as the API's timestamps: from the start of the first
 * day to the end of the last. The API refuses a range that ends before it starts, so that's caught here.
 */
export function utcRange(fromDay: string, toDay: string): { from?: string; to?: string; error?: string } {
  const day = /^\d{4}-\d{2}-\d{2}$/;
  const from = day.test(fromDay) ? `${fromDay}T00:00:00.000Z` : undefined;
  const to = day.test(toDay) ? `${toDay}T23:59:59.999Z` : undefined;
  if (from && to && from > to) return { error: "The start date must be on or before the end date." };
  return { from, to };
}
