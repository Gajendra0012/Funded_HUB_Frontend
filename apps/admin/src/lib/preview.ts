import { countryOptions, currentPreviewUser, roles } from "../mocks/legacy";
import type { AdminUser, PreviewState, PreviewCommand } from "../mocks/types";
export { countryOptions, currentPreviewUser, initialState, permissionMatrix, roles } from "../mocks/legacy";
export type { AdminUser, AuditEvent, PreviewState, Role, Settings } from "../mocks/types";
export type { UserInput, PreviewCommand } from "../mocks/types";
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
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}
