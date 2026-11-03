/**
 * Admin users (ADM-34): the rules behind the screen, kept apart from it so they can be tested.
 * The backend decides everything; these only shape what the screen shows and says.
 */
import type { ApiError } from "./api/errors";
import { formatUtc } from "./api/format";
import type { Schemas } from "./api/types";
import { sortRoles } from "./roles";

/** An admin member from `GET /admin/users`. */
export type StaffMember = Schemas["StaffMember"];
/** An account from `GET /admin/traders`: someone who signed up and isn't an admin yet. */
export type AccountRecord = Schemas["TraderRecord"];

/** The contract allows 1 to 4 roles per admin (all 4 roles). */
export const MAX_ROLES = 4;
/** How many accounts "Add admin" shows for a search. */
export const ACCOUNT_SEARCH_LIMIT = 10;
/** Admins per page. The API's maximum, so a normal team fits on one page. */
export const MEMBERS_PAGE_SIZE = 100;

/** First and last name from the profile, or "" when none is on file. */
export function personName(person: { first_name: string | null; last_name: string | null }): string {
  return [person.first_name, person.last_name]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

/** How messages name a person: their name, or their email when there's no name. */
export function personLabel(person: { first_name: string | null; last_name: string | null; email: string }): string {
  return personName(person) || person.email;
}

export const STATUS_LABEL: Record<StaffMember["status"], string> = { ACTIVE: "Active", DISABLED: "Disabled" };

export type StatusFilter = "" | StaffMember["status"];

/** The API can't filter admins by status (gap G11), so the screen filters the rows it has loaded. */
export function filterByStatus(members: readonly StaffMember[], status: StatusFilter): StaffMember[] {
  return status ? members.filter((member) => member.status === status) : [...members];
}

/** Rows by name, then email. The API returns them in ID order, which looks random (gap G11). */
export function sortMembers(members: readonly StaffMember[]): StaffMember[] {
  const key = (member: StaffMember) => personLabel(member).toLowerCase();
  return [...members].sort((a, b) => key(a).localeCompare(key(b)) || a.email.localeCompare(b.email));
}

/** The member's role names in the app's role order. */
export function roleNames(member: StaffMember): string[] {
  return sortRoles(member.roles).map((role) => role.name);
}

export function roleIdsOf(member: StaffMember): string[] {
  return member.roles.map((role) => role.id);
}

/** Same roles, in any order. */
export function sameIds(a: readonly string[], b: readonly string[]): boolean {
  const set = new Set(a);
  return set.size === new Set(b).size && b.every((id) => set.has(id));
}

/** The backend doesn't record admin sign-ins yet (gap G12): an empty value means "not recorded", not "never". */
export function lastLoginText(member: StaffMember): string {
  return member.last_login_at ? formatUtc(member.last_login_at) : "Not recorded";
}

export type MemberAction = "add" | "roles" | "disable" | "enable";

/** No answer came back, so a write may or may not have been saved: the list is loaded again to show which. */
export function outcomeUnknown(error: ApiError): boolean {
  return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT" || error.code === "INVALID_RESPONSE";
}

/** What a dialog says when its action fails. */
export function memberActionMessage(action: MemberAction, error: ApiError): string {
  if (outcomeUnknown(error)) return `${error.message} Check the list before trying again: the change may already be saved.`;
  switch (error.code) {
    case "CONFLICT":
      // Adding: the only unique value is the account (one membership per account).
      // Changing: the backend says why (your own access, or the last active Admin).
      return action === "add" ? "This account is already an admin. Find it in the list instead." : error.message;
    case "NOT_FOUND":
      return action === "add"
        ? "This account or a chosen role no longer exists, or the account isn't active. Search again."
        : "This admin or a chosen role no longer exists. Reload the page and try again.";
    default:
      return error.message;
  }
}
