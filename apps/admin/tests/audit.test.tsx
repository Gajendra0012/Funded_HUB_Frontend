import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuditDetails } from "../src/components/audit-screen";
import type { StaffMember } from "../src/lib/admin-users";
import {
  AUDIT_ACTIONS,
  actionLabel,
  actorLabel,
  actorNames,
  changedFirst,
  changedKeys,
  displayIp,
  entityTypeLabel,
  filterByIp,
  isUuid,
  recordName,
  utcRange,
  type AuditRecord,
} from "../src/lib/audit";

const contract = JSON.parse(readFileSync(new URL("../contract/openapi.json", import.meta.url), "utf8")) as {
  paths: Record<string, Record<string, { operationId?: string }>>;
};

const ADMIN_ID = "3cddad6e-4f50-43f1-a967-828add539b75";
function entry(overrides: Partial<AuditRecord> = {}): AuditRecord {
  return {
    id: "17",
    actor_type: "ADMIN",
    actor_id: ADMIN_ID,
    action: "disableAdminMember",
    entity_type: "admin_members",
    entity_id: "b5b209e2-4995-46da-8af9-207b40f3e952",
    before_data: { email: "qa-trader3@example.com", status: "ACTIVE", updated_at: "2026-11-03T11:27:35Z" },
    after_data: { email: "qa-trader3@example.com", status: "DISABLED", updated_at: "2026-11-03T11:28:00Z" },
    ip: "::ffff:127.0.0.1",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    request_id: "3ee94a40-dfd1-40b8-ab18-3b5acef62f80",
    created_at: "2026-11-03T13:54:04.925Z",
    ...overrides,
  };
}
const qaAdmin = { id: ADMIN_ID, email: "qa-admin@example.com", first_name: "QA", last_name: "Admin" } as StaffMember;
const role = (code: string) => ({ id: code, code, name: code, description: null, permissions: [] });

describe("audit log: what each entry says (ADM-35)", () => {
  it("knows every action the admin API records: exactly its write operations", () => {
    const writes = Object.entries(contract.paths)
      .filter(([path]) => path.startsWith("/api/v1/admin/"))
      .flatMap(([, item]) => Object.entries(item).filter(([method]) => method !== "get").map(([, operation]) => operation.operationId));
    expect(AUDIT_ACTIONS.map((action) => action.code).sort()).toEqual(writes.sort());
  });

  it("names actions in words, and says what an admin change did", () => {
    expect(actionLabel(entry())).toBe("Admin disabled");
    expect(actionLabel(entry({ action: "updateAdminSetting" }))).toBe("Setting changed");
    const update = (before: object, after: object) => actionLabel(entry({ action: "updateAdminMember", before_data: before, after_data: after }));
    expect(update({ status: "DISABLED" }, { status: "ACTIVE" })).toBe("Admin re-enabled");
    expect(update({ status: "ACTIVE" }, { status: "DISABLED" })).toBe("Admin disabled");
    expect(update({ status: "ACTIVE", roles: [role("SUPPORT")] }, { status: "ACTIVE", roles: [role("FINANCE"), role("SUPPORT")] })).toBe("Admin roles changed");
    expect(update({ status: "ACTIVE", roles: [role("ADMIN")] }, { status: "ACTIVE", roles: [role("ADMIN")] })).toBe("Admin changed");
    expect(actionLabel(entry({ action: "someNewAction" }))).toBe("someNewAction");
  });

  it("names the record from the entry itself, so it reads well after the record is gone", () => {
    expect(entityTypeLabel("admin_members")).toBe("Admin");
    expect(entityTypeLabel("new_table")).toBe("new_table");
    expect(recordName(entry())).toBe("qa-trader3@example.com");
    expect(recordName(entry({ after_data: null }))).toBe("qa-trader3@example.com");
    expect(recordName(entry({ entity_type: "system_settings", entity_id: "platform_name", before_data: { key: "platform_name" }, after_data: { key: "platform_name" } }))).toBe("platform_name");
    expect(recordName(entry({ before_data: null, after_data: { id: "x" }, entity_id: "c2378d0f-dbb5-42df-8c7b-d4d8f21ab153" }))).toBe("c2378d0f…");
    expect(recordName(entry({ before_data: null, after_data: null, entity_id: null }))).toBe("—");
  });

  it("shows who did it by name when the admin list is available, otherwise by a short ID", () => {
    const names = actorNames([qaAdmin]);
    expect(actorLabel(entry(), names)).toBe("QA Admin");
    expect(actorLabel(entry(), null)).toBe("Admin 3cddad6e…");
    expect(actorLabel(entry({ actor_type: "USER", actor_id: "c2378d0f-dbb5-42df-8c7b-d4d8f21ab153" }), names)).toBe("Trader c2378d0f…");
    expect(actorLabel(entry({ actor_type: "SYSTEM", actor_id: null }), names)).toBe("System");
  });

  it("lists the top-level fields that changed, and puts them first for the before/after view", () => {
    expect(changedKeys({ a: 1, b: [1], c: "x" }, { a: 1, b: [2], d: true })).toEqual(["b", "c", "d"]);
    expect(changedKeys(null, { a: 1 })).toEqual(["a"]);
    expect(Object.keys(changedFirst({ id: 1, roles: [], status: "ACTIVE", updated_at: "t1" }, ["status", "updated_at"]))).toEqual(["status", "updated_at", "id", "roles"]);
  });
});

describe("audit log: filters (ADM-35)", () => {
  it("shows IPv4 addresses the way people write them", () => {
    expect(displayIp("::ffff:127.0.0.1")).toBe("127.0.0.1");
    expect(displayIp("2001:db8::1")).toBe("2001:db8::1");
    expect(displayIp(null)).toBe("—");
  });

  it("filters the loaded entries by IP, written either way (the API can't, gap G6)", () => {
    const entries = [entry({ id: "1" }), entry({ id: "2", ip: "203.0.113.9" }), entry({ id: "3", ip: null })];
    expect(filterByIp(entries, "127.0.0.1").map((e) => e.id)).toEqual(["1"]);
    expect(filterByIp(entries, "::ffff:127").map((e) => e.id)).toEqual(["1"]);
    expect(filterByIp(entries, "203.0").map((e) => e.id)).toEqual(["2"]);
    expect(filterByIp(entries, "  ").map((e) => e.id)).toEqual(["1", "2", "3"]);
  });

  it("accepts only a whole admin ID, as the API does", () => {
    expect(isUuid(ADMIN_ID)).toBe(true);
    expect(isUuid(` ${ADMIN_ID} `)).toBe(true);
    expect(isUuid("3cddad6e")).toBe(false);
    expect(isUuid("3cddad6e-4f50-43f1-a967-828add539b7")).toBe(false);
    expect(isUuid("3cddad6e-4f50-93f1-a967-828add539b75")).toBe(false);
  });

  it("turns UTC days into a range from the first second to the last, and refuses a backwards range", () => {
    expect(utcRange("2026-11-03", "2026-11-03")).toEqual({ from: "2026-11-03T00:00:00.000Z", to: "2026-11-03T23:59:59.999Z" });
    expect(utcRange("2026-11-01", "")).toEqual({ from: "2026-11-01T00:00:00.000Z", to: undefined });
    expect(utcRange("2026-11-04", "2026-11-03").error).toBe("The start date must be on or before the end date.");
  });
});

describe("audit log: an entry in full (ADM-35)", () => {
  it("shows who, what, where from, and the record before and after", () => {
    const html = renderToStaticMarkup(<AuditDetails entry={entry()} names={actorNames([qaAdmin])} />);
    expect(html).toContain("QA Admin (qa-admin@example.com)");
    expect(html).toContain("Admin disabled");
    expect(html).toContain("disableAdminMember");
    expect(html).toContain("Admin · qa-trader3@example.com");
    expect(html).toContain("<code>127.0.0.1</code>");
    expect(html).toContain("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    expect(html).toContain("3ee94a40-dfd1-40b8-ab18-3b5acef62f80");
    expect(html).toContain("Changed: status, updated_at");
    expect(html).toContain("<h3>Before</h3>");
    expect(html).toContain("<h3>After</h3>");
  });

  it("says when a record was created or removed, and works without names", () => {
    expect(renderToStaticMarkup(<AuditDetails entry={entry({ before_data: null })} names={null} />)).toContain("New record");
    const removed = renderToStaticMarkup(<AuditDetails entry={entry({ after_data: null })} names={null} />);
    expect(removed).toContain("Record removed");
    expect(removed).toContain("Admin 3cddad6e…");
  });
});
