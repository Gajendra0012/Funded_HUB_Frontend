"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  ACCOUNT_SEARCH_LIMIT,
  MAX_ROLES,
  memberActionMessage,
  personLabel,
  personName,
  roleIdsOf,
  roleNames,
  sameIds,
  type AccountRecord,
  type StaffMember,
} from "@/lib/admin-users";
import { outcomeUnknown, type ApiError } from "@/lib/api/errors";
import { cleanQuery, queryKey, SEARCH_MAX_LENGTH } from "@/lib/api/paging";
import type { ApiResult, PageMeta } from "@/lib/api/types";
import { useCursorList, useDebouncedValue } from "@/lib/api/use-cursor-list";
import type { StaffRole } from "@/lib/roles";
import { ActionDialog, FormError } from "./action-dialog";
import { FreshCodeField, useFreshCode } from "./fresh-code-field";
import { useAdminApi } from "./admin-api-provider";

/** The roles the pickers offer, from `GET /admin/roles`. */
export type RoleOptions =
  | { status: "loading" }
  | { status: "error"; error: ApiError; retry: () => void }
  | { status: "ready"; roles: StaffRole[] };

/** What every action dialog hands back to the screen. */
type DialogHandlers = {
  onClose: () => void;
  /** No answer came back: the screen loads the list again to show what was saved. */
  onUncertain: () => void;
};

/** Role checkboxes: at least one, at most 4 (the contract's limits). */
function RolePicker({ options, value, onChange, disabled, testId }: { options: RoleOptions; value: string[]; onChange: (ids: string[]) => void; disabled: boolean; testId: string }) {
  if (options.status === "loading") {
    return (
      <p className="small-note" role="status">
        Loading roles…
      </p>
    );
  }
  if (options.status === "error") {
    return (
      <div className="inline-alert" role="alert" data-testid={`${testId}-error`}>
        <p>The roles didn&apos;t load. {options.error.message}</p>
        <button type="button" className="button button-secondary" onClick={options.retry} data-testid={`${testId}-retry`}>
          Try again
        </button>
      </div>
    );
  }
  return (
    <fieldset className="ops-checkboxes" disabled={disabled} data-testid={testId}>
      <legend>Roles</legend>
      {options.roles.map((role) => {
        const checked = value.includes(role.id);
        return (
          <label key={role.id}>
            <input
              type="checkbox"
              name="roles"
              value={role.id}
              checked={checked}
              disabled={!checked && value.length >= MAX_ROLES}
              onChange={(event) => onChange(event.target.checked ? [...value, role.id] : value.filter((id) => id !== role.id))}
              data-testid={`${testId}-${role.code}`}
            />
            {role.name}
          </label>
        );
      })}
    </fieldset>
  );
}

// ─── Add admin ──────────────────────────────────────────────────────────────────────────────────

const NO_ACCOUNTS: ApiResult<AccountRecord[], PageMeta> = { ok: true, status: 200, data: [], meta: { next_cursor: null } };

/**
 * Add admin (ADM-34): give an existing account one or more roles with `POST /admin/users`.
 * The backend doesn't create logins or send invites (gap G3), so the person must have signed up.
 */
export function AddAdminDialog({ open, formKey, roles, onAdded, ...handlers }: DialogHandlers & { open: boolean; formKey: number; roles: RoleOptions; onAdded: (member: StaffMember) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <ActionDialog open={open} title="Add admin" busy={busy} onClose={handlers.onClose}>
      <AddAdminForm key={formKey} roles={roles} busy={busy} setBusy={setBusy} onAdded={onAdded} {...handlers} />
    </ActionDialog>
  );
}

function AddAdminForm({ roles, busy, setBusy, onAdded, onClose, onUncertain }: DialogHandlers & { roles: RoleOptions; busy: boolean; setBusy: (busy: boolean) => void; onAdded: (member: StaffMember) => void }) {
  const api = useAdminApi();
  const fresh = useFreshCode();
  const [text, setText] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Only accounts that can become admins: signed up, active and not admins already (the traders list
  // leaves admin members out).
  const typed = cleanQuery({ q: text }).q ?? "";
  const debounced = useDebouncedValue(typed, 300);
  const query = cleanQuery({ q: debounced });
  const results = useCursorList(queryKey(query), (_cursor, signal) =>
    query.q ? api.get("/api/v1/admin/traders", { query: { q: query.q, status: "ACTIVE", limit: ACCOUNT_SEARCH_LIMIT }, signal }) : Promise.resolve(NO_ACCOUNTS),
  );
  // The results on screen belong to what's in the box (not to an older search still being replaced).
  const settled = typed === debounced && results.status !== "loading";
  const account = settled ? (results.items.find((item) => item.id === accountId) ?? null) : null;
  const ready = account !== null && roleIds.length > 0 && roles.status === "ready" && fresh.complete && !busy;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || !account) return;
    setBusy(true);
    setError("");
    const problem = await fresh.confirm();
    if (problem) {
      setBusy(false);
      return setError(problem);
    }
    const result = await api.post("/api/v1/admin/users", { body: { profile_id: account.id, role_ids: roleIds } });
    setBusy(false);
    if (result.ok) return onAdded(result.data);
    setError(memberActionMessage("add", result.error));
    if (outcomeUnknown(result.error)) onUncertain();
  }

  let found: ReactNode;
  if (!typed) {
    found = <p className="small-note">Type an email or a name to find the account.</p>;
  } else if (!settled) {
    found = (
      <p className="small-note" role="status">
        Searching…
      </p>
    );
  } else if (results.status === "error" && results.error) {
    found = (
      <div className="inline-alert" role="alert" data-testid="add-admin-search-error">
        <p>{results.error.message}</p>
        <button type="button" className="button button-secondary" onClick={results.retry} data-testid="add-admin-search-retry">
          Try again
        </button>
      </div>
    );
  } else if (!results.items.length) {
    found = (
      <p className="small-note" data-testid="add-admin-no-results">
        No active account matches “{query.q}”. The person must sign up on the website first, or they may already be an admin.
      </p>
    );
  } else {
    found = (
      <fieldset className="account-results" disabled={busy}>
        <legend>Choose the account</legend>
        {results.items.map((item) => (
          <label key={item.id} className="account-option">
            <input
              type="radio"
              name="account"
              value={item.id}
              checked={accountId === item.id}
              onChange={() => setAccountId(item.id)}
              data-testid="add-admin-account"
              data-email={item.email}
            />
            <span>
              <strong>{personName(item) || "No name on file"}</strong>
              <span className="small-note">{item.email}</span>
            </span>
          </label>
        ))}
        {results.hasMore && <p className="small-note">Showing the first {ACCOUNT_SEARCH_LIMIT} matches. Type more of the email to narrow it down.</p>}
      </fieldset>
    );
  }

  return (
    <form className="ops-form" onSubmit={submit} data-testid="add-admin-form">
      <p className="dialog-note">
        Give admin access to someone who already has an account. They must sign up on the website first: email invites aren&apos;t available
        yet. At their next sign-in they set up 2FA before they can use the admin app.
      </p>
      <label className="ops-field">
        Find the account
        <input
          type="search"
          name="account-search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Email or name…"
          autoComplete="off"
          spellCheck={false}
          maxLength={SEARCH_MAX_LENGTH}
          disabled={busy}
          data-testid="add-admin-search"
        />
      </label>
      {found}
      <RolePicker options={roles} value={roleIds} onChange={setRoleIds} disabled={busy} testId="add-admin-roles" />
      <FreshCodeField fresh={fresh} testId="add-admin-code" />
      <FormError message={error} testId="add-admin-error" />
      <footer>
        <button type="button" onClick={onClose} disabled={busy} data-testid="add-admin-cancel">
          Cancel
        </button>
        <button type="submit" className="ui-primary" disabled={!ready} data-testid="add-admin-submit">
          {busy ? "Adding…" : "Add admin"}
        </button>
      </footer>
    </form>
  );
}

// ─── Change roles ───────────────────────────────────────────────────────────────────────────────

/** Change roles (ADM-34): `PATCH /admin/users/{id}` with the new role IDs. */
export function ChangeRolesDialog({ open, formKey, member, roles, onSaved, ...handlers }: DialogHandlers & { open: boolean; formKey: number; member: StaffMember | null; roles: RoleOptions; onSaved: (member: StaffMember) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <ActionDialog open={open} title="Change roles" busy={busy} onClose={handlers.onClose}>
      {member && <ChangeRolesForm key={formKey} member={member} roles={roles} busy={busy} setBusy={setBusy} onSaved={onSaved} {...handlers} />}
    </ActionDialog>
  );
}

function ChangeRolesForm({ member, roles, busy, setBusy, onSaved, onClose, onUncertain }: DialogHandlers & { member: StaffMember; roles: RoleOptions; busy: boolean; setBusy: (busy: boolean) => void; onSaved: (member: StaffMember) => void }) {
  const api = useAdminApi();
  const [roleIds, setRoleIds] = useState(() => roleIdsOf(member));
  const fresh = useFreshCode();
  const [error, setError] = useState("");
  const ready = roleIds.length > 0 && !sameIds(roleIds, roleIdsOf(member)) && roles.status === "ready" && fresh.complete && !busy;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    const problem = await fresh.confirm();
    if (problem) {
      setBusy(false);
      return setError(problem);
    }
    const result = await api.patch("/api/v1/admin/users/{id}", { path: { id: member.id }, body: { role_ids: roleIds } });
    setBusy(false);
    if (result.ok) return onSaved(result.data);
    setError(memberActionMessage("roles", result.error));
    if (outcomeUnknown(result.error)) onUncertain();
  }

  return (
    <form className="ops-form" onSubmit={submit} data-testid="change-roles-form">
      <p className="dialog-note">
        Roles decide what <strong>{personLabel(member)}</strong> can see and do. The change applies from their next request and is recorded in
        the audit log.
      </p>
      <RolePicker options={roles} value={roleIds} onChange={setRoleIds} disabled={busy} testId="change-roles-roles" />
      {roleIds.length === 0 && (
        <p className="small-note" data-testid="change-roles-hint">
          Choose at least one role. To remove all access, disable the admin instead.
        </p>
      )}
      <FreshCodeField fresh={fresh} testId="change-roles-code" />
      <FormError message={error} testId="change-roles-error" />
      <footer>
        <button type="button" onClick={onClose} disabled={busy} data-testid="change-roles-cancel">
          Cancel
        </button>
        <button type="submit" className="ui-primary" disabled={!ready} data-testid="change-roles-submit">
          {busy ? "Saving…" : "Save roles"}
        </button>
      </footer>
    </form>
  );
}

// ─── Disable and re-enable ──────────────────────────────────────────────────────────────────────

export type StatusAction = "disable" | "enable";

/**
 * Disable (`DELETE /admin/users/{id}`) or re-enable (`PATCH` with `status: ACTIVE`) an admin (ADM-34).
 * `onDone` gets the server's copy of the member, or null when it couldn't be read back.
 */
export function StatusDialog({ open, formKey, action, member, onDone, ...handlers }: DialogHandlers & { open: boolean; formKey: number; action: StatusAction; member: StaffMember | null; onDone: (action: StatusAction, member: StaffMember | null, previous: StaffMember) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <ActionDialog open={open} title={action === "disable" ? "Disable admin" : "Re-enable admin"} busy={busy} onClose={handlers.onClose}>
      {member && <StatusForm key={formKey} action={action} member={member} busy={busy} setBusy={setBusy} onDone={onDone} {...handlers} />}
    </ActionDialog>
  );
}

function StatusForm({ action, member, busy, setBusy, onDone, onClose, onUncertain }: DialogHandlers & { action: StatusAction; member: StaffMember; busy: boolean; setBusy: (busy: boolean) => void; onDone: (action: StatusAction, member: StaffMember | null, previous: StaffMember) => void }) {
  const api = useAdminApi();
  const [error, setError] = useState("");
  const name = personLabel(member);
  const fresh = useFreshCode();

  function failed(error: ApiError) {
    setBusy(false);
    setError(memberActionMessage(action, error));
    if (outcomeUnknown(error)) onUncertain();
  }

  async function confirm() {
    if (busy || !fresh.complete) return;
    setBusy(true);
    setError("");
    const problem = await fresh.confirm();
    if (problem) {
      setBusy(false);
      return setError(problem);
    }
    if (action === "disable") {
      const result = await api.delete("/api/v1/admin/users/{id}", { path: { id: member.id } });
      if (!result.ok) return failed(result.error);
      // A disable answers 204 with no body: read the member back so the list shows the server's copy.
      const fresh = await api.get("/api/v1/admin/users/{id}", { path: { id: member.id } });
      setBusy(false);
      return onDone(action, fresh.ok ? fresh.data : null, member);
    }
    const result = await api.patch("/api/v1/admin/users/{id}", { path: { id: member.id }, body: { status: "ACTIVE" } });
    if (!result.ok) return failed(result.error);
    setBusy(false);
    onDone(action, result.data, member);
  }

  return (
    <div className="ops-form" data-testid="status-form" data-action={action}>
      <p className="dialog-note">
        {action === "disable" ? (
          <>
            <strong>{name}</strong> loses access to the admin app at once: the backend refuses their next request. Their history stays in the
            audit log, and you can re-enable them later.
          </>
        ) : (
          <>
            <strong>{name}</strong> gets access back with the same roles ({roleNames(member).join(", ") || "none"}). The change is recorded in
            the audit log.
          </>
        )}
      </p>
      <FreshCodeField fresh={fresh} testId="status-code" />
      <FormError message={error} testId="status-error" />
      <footer>
        <button type="button" onClick={onClose} disabled={busy} data-testid="status-cancel">
          Cancel
        </button>
        <button type="button" className="ui-primary" onClick={() => void confirm()} disabled={busy || !fresh.complete} data-testid="status-confirm">
          {busy ? (action === "disable" ? "Disabling…" : "Re-enabling…") : action === "disable" ? "Disable admin" : "Re-enable admin"}
        </button>
      </footer>
    </div>
  );
}
