export const roles = ["Admin", "Risk", "Support", "Finance"] as const;
export type Role = (typeof roles)[number];
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: "Active" | "Invited" | "Disabled";
  twoFactor: "Enrolled" | "Setup required";
  lastLogin: string | null;
};
export const countryOptions = [
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" }, { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" }, { code: "SG", name: "Singapore" },
];
export type Settings = { platformName: string; supportEmail: string; restrictedCountries: string[] };
export type AuditEvent = { id: string; at: string; actor: string; action: string; entity: string; ip: string; before: unknown; after: unknown };
export type PreviewState = { users: AdminUser[]; events: AuditEvent[]; settings: Settings };
export const currentPreviewUser = "staff-001";

export const initialState: PreviewState = {
  users: [
    { id: "staff-001", name: "Alex Morgan", email: "alex@example.com", roles: ["Admin"], status: "Active", twoFactor: "Enrolled", lastLogin: "2026-10-29T09:00:00Z" },
    { id: "staff-002", name: "Jordan Lee", email: "jordan@example.com", roles: ["Admin", "Risk"], status: "Active", twoFactor: "Enrolled", lastLogin: "2026-10-29T08:32:00Z" },
    { id: "staff-003", name: "Samira Khan", email: "samira@example.com", roles: ["Risk"], status: "Active", twoFactor: "Enrolled", lastLogin: "2026-10-29T08:14:00Z" },
    { id: "staff-004", name: "Daniel Brooks", email: "daniel@example.com", roles: ["Support"], status: "Active", twoFactor: "Enrolled", lastLogin: "2026-10-28T16:30:00Z" },
    { id: "staff-005", name: "Priya Shah", email: "priya@example.com", roles: ["Finance"], status: "Invited", twoFactor: "Setup required", lastLogin: null },
    { id: "staff-006", name: "Evan Reed", email: "evan@example.com", roles: ["Support"], status: "Disabled", twoFactor: "Enrolled", lastLogin: "2026-10-23T10:18:00Z" },
  ],
  events: [
    { id: "event-005", at: "2026-10-29T09:00:00Z", actor: "Alex Morgan", action: "admin.login", entity: "staff-001", ip: "192.0.2.10", before: null, after: { outcome: "Sample sign-in" } },
    { id: "event-004", at: "2026-10-29T08:45:00Z", actor: "Alex Morgan", action: "admin.created", entity: "staff-005", ip: "192.0.2.10", before: null, after: { email: "priya@example.com", roles: ["Finance"], status: "Invited" } },
    { id: "event-003", at: "2026-10-29T08:20:00Z", actor: "Jordan Lee", action: "admin.updated", entity: "staff-003", ip: "192.0.2.11", before: { roles: ["Support"] }, after: { roles: ["Risk"] } },
    { id: "event-002", at: "2026-10-28T16:45:00Z", actor: "Alex Morgan", action: "settings.updated", entity: "platform", ip: "192.0.2.10", before: { platformName: "Demo" }, after: { platformName: "NovaEdge Capital" } },
    { id: "event-001", at: "2026-10-28T15:10:00Z", actor: "Alex Morgan", action: "admin.disabled", entity: "staff-006", ip: "192.0.2.10", before: { status: "Active" }, after: { status: "Disabled" } },
  ],
  settings: { platformName: "NovaEdge Capital", supportEmail: "support@example.com", restrictedCountries: [] },
};

export type UserInput = Pick<AdminUser, "name" | "email" | "roles">;
export type PreviewCommand =
  | { type: "create-user"; user: UserInput }
  | { type: "update-user"; id: string; user: UserInput }
  | { type: "toggle-user"; id: string }
  | { type: "save-settings"; settings: Settings };

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function applyPreviewCommand(state: PreviewState, command: PreviewCommand, meta: { id: string; at: string }): PreviewState {
  let users = state.users;
  let settings = state.settings;
  let before: unknown = null;
  let after: unknown;
  let entity: string;
  let action: string;

  if (command.type === "save-settings") {
    if (!command.settings.platformName.trim() || command.settings.platformName.length > 80) throw new Error("Enter a platform name of 1–80 characters.");
    if (!validateEmail(command.settings.supportEmail.trim())) throw new Error("Enter a valid support email.");
    if (command.settings.restrictedCountries.some(code => !countryOptions.some(country => country.code === code))) throw new Error("Select a country from the preview list.");
    before = settings;
    settings = { ...command.settings, platformName: command.settings.platformName.trim(), supportEmail: command.settings.supportEmail.trim().toLowerCase(), restrictedCountries: [...new Set(command.settings.restrictedCountries)] };
    after = settings;
    entity = "platform";
    action = "settings.updated";
  } else {
    const existing = command.type === "create-user" ? null : state.users.find(user => user.id === command.id);
    if (command.type !== "create-user" && !existing) throw new Error("This preview user no longer exists.");
    before = existing;
    if (command.type === "toggle-user" && existing) {
      if (existing.status === "Invited") throw new Error("An invitation is not an active account. Edit its details instead.");
      if (existing.id === currentPreviewUser) throw new Error("You cannot disable your current preview administrator.");
      const updated = { ...existing, status: existing.status === "Active" ? "Disabled" as const : "Active" as const };
      users = state.users.map(user => user.id === existing.id ? updated : user);
      after = updated;
      entity = existing.id;
      action = updated.status === "Active" ? "admin.enabled" : "admin.disabled";
    } else if (command.type !== "toggle-user") {
      const input = { name: command.user.name.trim(), email: command.user.email.trim().toLowerCase(), roles: [...new Set(command.user.roles)] };
      if (!input.name || input.name.length > 80) throw new Error("Enter a name of 1–80 characters.");
      if (!validateEmail(input.email) || input.email.length > 254) throw new Error("Enter a valid email address.");
      if (!input.roles.length || input.roles.some(role => !roles.includes(role))) throw new Error("Select at least one valid role.");
      if (state.users.some(user => user.id !== existing?.id && user.email.toLowerCase() === input.email)) throw new Error("A preview user with this email already exists.");
      if (existing?.id === currentPreviewUser && !input.roles.includes("Admin")) throw new Error("Keep the Admin role on your current preview account.");
      const updated: AdminUser = existing ? { ...existing, ...input } : { ...input, id: meta.id, status: "Invited", twoFactor: "Setup required", lastLogin: null };
      users = existing ? state.users.map(user => user.id === existing.id ? updated : user) : [...state.users, updated];
      after = updated;
      entity = updated.id;
      action = existing ? "admin.updated" : "admin.created";
    } else {
      throw new Error("Invalid preview command.");
    }
    if (!users.some(user => user.status === "Active" && user.roles.includes("Admin"))) throw new Error("Keep at least one active administrator.");
  }

  return { users, settings, events: [{ id: meta.id, at: meta.at, actor: "Alex Morgan (preview)", action, entity, ip: "Preview · no IP collected", before, after }, ...state.events] };
}

export function formatTimestamp(value: string | null) {
  if (!value) return "Not signed in";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }).format(new Date(value));
}

// Display-only reference from Sprint 1 Detailed Plan pp. 10–11, not an authorization policy.
export const permissionMatrix: { label: string; allowed: readonly Role[] }[] = [
  { label: "View traders and accounts", allowed: roles },
  { label: "Edit trader details", allowed: ["Admin", "Support"] },
  { label: "Manage programs, add-ons and payout settings", allowed: ["Admin"] },
  { label: "Publish rule sets", allowed: ["Admin", "Risk"] },
  { label: "View risk monitor and violations", allowed: ["Admin", "Risk", "Support"] },
  { label: "Take risk actions", allowed: ["Admin", "Risk"] },
  { label: "Review abuse flags", allowed: ["Admin", "Risk"] },
  { label: "Review KYC", allowed: ["Admin", "Support"] },
  { label: "View orders/payments and record refunds", allowed: ["Admin", "Finance"] },
  { label: "Approve payouts", allowed: ["Admin", "Finance"] },
  { label: "Manage affiliates and discount codes", allowed: ["Admin", "Finance"] },
  { label: "Manage content, templates and competitions", allowed: ["Admin", "Support"] },
  { label: "View reports and exports", allowed: ["Admin", "Risk", "Finance"] },
  { label: "Manage admin users and roles", allowed: ["Admin"] },
  { label: "View the audit log", allowed: ["Admin", "Risk", "Finance"] },
  { label: "Change system settings", allowed: ["Admin"] },
];
