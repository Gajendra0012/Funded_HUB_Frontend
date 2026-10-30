import { describe, expect, it } from "vitest";
import { applyPreviewCommand, initialState, currentPreviewUser, type PreviewState } from "../src/lib/preview";

const meta = { id: "new-id", at: "2026-10-29T12:00:00Z" };
const newUser = { name: "  Casey Quinn  ", email: "CASEY@example.com", roles: ["Support" as const] };

describe("admin in-memory preview changes", () => {
  it("creates a normalized invitation and event without mutating seed data", () => {
    const state = applyPreviewCommand(initialState, { type: "create-user", user: newUser }, meta);
    expect(state.users).toHaveLength(initialState.users.length + 1);
    expect(state.users.at(-1)).toMatchObject({ name: "Casey Quinn", email: "casey@example.com", status: "Invited", twoFactor: "Setup required" });
    expect(state.events[0]).toMatchObject({ action: "admin.created", entity: "new-id", before: null });
    expect(initialState.users).toHaveLength(6);
    expect(initialState.events).toHaveLength(5);
  });
  it("rejects duplicate emails regardless of case or whitespace", () => {
    expect(() => applyPreviewCommand(initialState, { type: "create-user", user: { ...newUser, email: " ALEX@EXAMPLE.COM " } }, meta)).toThrow("already exists");
  });
  it("rejects missing roles and invalid user details", () => {
    expect(() => applyPreviewCommand(initialState, { type: "create-user", user: { ...newUser, roles: [] } }, meta)).toThrow("role");
    expect(() => applyPreviewCommand(initialState, { type: "create-user", user: { ...newUser, email: "invalid" } }, meta)).toThrow("email");
  });
  it("preserves the current preview administrator", () => {
    expect(() => applyPreviewCommand(initialState, { type: "toggle-user", id: currentPreviewUser }, meta)).toThrow("current preview");
    expect(() => applyPreviewCommand(initialState, { type: "update-user", id: currentPreviewUser, user: { ...newUser } }, meta)).toThrow("Keep the Admin");
  });
  it("records before and after values when disabling and re-enabling a user", () => {
    const disabled = applyPreviewCommand(initialState, { type: "toggle-user", id: "staff-003" }, meta);
    expect(disabled.users.find(user => user.id === "staff-003")?.status).toBe("Disabled");
    expect(disabled.events[0].before).toMatchObject({ status: "Active" });
    expect(disabled.events[0].after).toMatchObject({ status: "Disabled" });
    const enabled = applyPreviewCommand(disabled, { type: "toggle-user", id: "staff-003" }, { ...meta, id: "event-enabled" });
    expect(enabled.events[0].action).toBe("admin.enabled");
    expect(enabled.users.find(user => user.id === "staff-003")?.status).toBe("Active");
  });
  it("rejects unknown users and protects the last active administrator", () => {
    expect(() => applyPreviewCommand(initialState, { type: "toggle-user", id: "missing" }, meta)).toThrow("no longer exists");
    const state: PreviewState = { ...initialState, users: initialState.users.filter(user => user.id !== currentPreviewUser) };
    expect(() => applyPreviewCommand(state, { type: "toggle-user", id: "staff-002" }, meta)).toThrow("at least one");
  });
  it("validates and audits settings without changing the seed policy", () => {
    const settings = { ...initialState.settings, restrictedCountries: ["US", "US"], platformName: "Preview Brand" };
    const next = applyPreviewCommand(initialState, { type: "save-settings", settings }, meta);
    expect(next.settings.restrictedCountries).toEqual(["US"]);
    expect(next.events[0].action).toBe("settings.updated");
    expect(initialState.settings.restrictedCountries).toEqual([]);
    expect(() => applyPreviewCommand(initialState, { type: "save-settings", settings: { ...settings, restrictedCountries: ["XX"] } }, meta)).toThrow("preview list");
  });
});
