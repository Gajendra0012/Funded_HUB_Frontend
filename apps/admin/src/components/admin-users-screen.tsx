"use client";

import { useId, useState, type ReactNode } from "react";
import { DataTable, KeyValueList, RoleBadge, StatusChip, Toast, type TableColumn } from "@funded-hub/ui";
import {
  filterByStatus,
  lastLoginText,
  MEMBERS_PAGE_SIZE,
  personLabel,
  personName,
  roleNames,
  sortMembers,
  STATUS_LABEL,
  type StaffMember,
  type StatusFilter,
} from "@/lib/admin-users";
import { formatUtc } from "@/lib/api/format";
import { cleanQuery, queryKey, SEARCH_MAX_LENGTH } from "@/lib/api/paging";
import { useCursorList, useDebouncedValue } from "@/lib/api/use-cursor-list";
import { sortRoles } from "@/lib/roles";
import { useAdminApi } from "./admin-api-provider";
import { AddAdminDialog, ChangeRolesDialog, StatusDialog, type RoleOptions, type StatusAction } from "./admin-user-dialogs";
import { ApiErrorPanel } from "./api-error-panel";
import { LoadingPanel } from "./loading-panel";
import { LoadMore } from "./load-more";

type DialogKind = "add" | "roles" | StatusAction;
/** The open (or last opened) dialog. It keeps its member while closing; `id` gives each opening a fresh form. */
type DialogState = { kind: DialogKind; member: StaffMember | null; id: number; open: boolean };

type MemberAction = Exclude<DialogKind, "add">;

const SELF_REASON = "You can't change your own access. Ask another admin.";
const RESET_2FA_REASON = "Not available yet.";

/**
 * Admin users (ADM-34), live: list and search, add an existing account, change roles, disable and
 * re-enable. The backend refuses what isn't allowed (your own access, the last active Admin) and
 * records every change in the audit log.
 */
export function AdminUsersScreen({ currentProfileId }: { currentProfileId: string }) {
  const api = useAdminApi();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toast, setToast] = useState("");

  const debounced = useDebouncedValue(search, 300);
  const query = cleanQuery({ q: debounced });
  const list = useCursorList(queryKey(query), (cursor, signal) =>
    api.get("/api/v1/admin/users", { query: { ...query, limit: MEMBERS_PAGE_SIZE, cursor: cursor ?? undefined }, signal }),
  );
  const roleList = useCursorList("roles", (cursor, signal) =>
    api.get("/api/v1/admin/roles", { query: { limit: 100, cursor: cursor ?? undefined }, signal }),
  );
  const roles: RoleOptions =
    roleList.status === "loading"
      ? { status: "loading" }
      : roleList.status === "error" && roleList.error
        ? { status: "error", error: roleList.error, retry: roleList.retry }
        : { status: "ready", roles: sortRoles(roleList.items) };

  const isSelf = (member: StaffMember) => member.profile_id === currentProfileId;
  const latest = (member: StaffMember) => list.items.find((item) => item.id === member.id) ?? member;

  function open(kind: DialogKind, member: StaffMember | null = null) {
    setDialog((previous) => ({ kind, member, id: (previous?.id ?? 0) + 1, open: true }));
  }
  const close = () => setDialog((previous) => previous && { ...previous, open: false });
  const handlers = { onClose: close, onUncertain: list.reload };

  function done(message: string, member: StaffMember | null) {
    close();
    setToast(message);
    if (member) list.replaceItem(member);
    else list.reload();
  }

  // A page refused as a whole (no admins.manage): the shared "no permission" panel, no actions.
  if (list.error?.code === "FORBIDDEN" && list.status === "error") return <ApiErrorPanel error={list.error} />;

  const rows = sortMembers(filterByStatus(list.items, status));
  const columns: TableColumn<StaffMember>[] = [
    {
      key: "name",
      header: "Name",
      cell: (member) => (
        <span>
          {personName(member) || <span className="muted-cell">No name on file</span>}
          {isSelf(member) && <span className="you-label">You</span>}
        </span>
      ),
      sortValue: (member) => personLabel(member).toLowerCase(),
    },
    { key: "email", header: "Email", cell: (member) => member.email, sortValue: (member) => member.email },
    {
      key: "roles",
      header: "Roles",
      cell: (member) => (
        <div className="role-pills">
          {roleNames(member).map((name) => (
            <RoleBadge key={name} role={name} />
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (member) => <StatusChip state={member.status === "ACTIVE" ? "profit" : "neutral"}>{STATUS_LABEL[member.status]}</StatusChip>,
      sortValue: (member) => member.status,
    },
    {
      key: "twoFactor",
      header: "2FA",
      cell: (member) => <StatusChip state={member.two_factor_enrolled ? "profit" : "caution"}>{member.two_factor_enrolled ? "Set up" : "Not set up"}</StatusChip>,
    },
    { key: "login", header: "Last login · UTC", cell: (member) => <span className="muted-cell">{lastLoginText(member)}</span> },
    {
      key: "actions",
      header: "Actions",
      cell: (member) => <MemberActions member={member} self={isSelf(member)} onAction={open} variant="menu" />,
    },
  ];

  let body: ReactNode;
  if (list.status === "loading") body = <LoadingPanel label="Loading admin users" inline />;
  else if (list.status === "error" && list.error) body = <ApiErrorPanel error={list.error} onRetry={list.retry} inline />;
  else {
    body = (
      <DataTable
        rows={rows}
        columns={columns}
        label="Admins"
        rowLabel={(member) => `Open details for ${personLabel(member)}`}
        rowTestId={(member) => `admin-row-${member.email}`}
        detailTitle="Admin details"
        empty={
          query.q || status
            ? { title: "No admins match", description: "Try changing or clearing the search and status filter." }
            : { title: "No admins yet", description: "Add the first admin with “Add admin”." }
        }
        renderDetail={(member) => <MemberDetails member={latest(member)} self={isSelf(member)} onAction={open} />}
      />
    );
  }

  const member = dialog?.member ?? null;
  const statusAction: StatusAction = dialog?.kind === "enable" ? "enable" : "disable";
  return (
    <>
      <section className="panel admin-users-panel">
        <div className="panel-header">
          <div>
            <h2>Admin team</h2>
            <p>Who can use the admin app, with their roles and 2FA</p>
          </div>
          <button type="button" className="ui-primary" onClick={() => open("add")} data-testid="add-admin">
            Add admin
          </button>
        </div>
        <div className="ui-filters">
          <label>
            <span className="ui-sr">Search admins by name or email</span>
            <input
              type="search"
              name="admin-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email…"
              autoComplete="off"
              spellCheck={false}
              maxLength={SEARCH_MAX_LENGTH}
              data-testid="admins-search"
            />
          </label>
          <label className="ui-filter-chip">
            Status
            <select name="admin-status" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} data-testid="admins-status">
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
            }}
            data-testid="admins-clear"
          >
            Clear all
          </button>
        </div>
        {body}
        {status && list.hasMore && (
          <p className="small-note filter-note" data-testid="status-filter-note">
            The status filter covers the {list.items.length} admins loaded so far. Load more to check the rest.
          </p>
        )}
        <LoadMore status={list.status} hasMore={list.hasMore} count={rows.length} error={list.error} onLoadMore={list.loadMore} />
      </section>

      <AddAdminDialog
        open={dialog?.open === true && dialog.kind === "add"}
        formKey={dialog?.id ?? 0}
        roles={roles}
        onAdded={(added) => {
          close();
          setToast(
            `${personLabel(added)} is now an admin (${roleNames(added).join(", ")}).` +
              (added.two_factor_enrolled ? "" : " They set up 2FA at their next sign-in."),
          );
          list.reload();
        }}
        {...handlers}
      />
      <ChangeRolesDialog
        open={dialog?.open === true && dialog.kind === "roles"}
        formKey={dialog?.id ?? 0}
        member={dialog?.kind === "roles" ? member : null}
        roles={roles}
        onSaved={(saved) => done(`Roles saved for ${personLabel(saved)}: ${roleNames(saved).join(", ")}.`, saved)}
        {...handlers}
      />
      <StatusDialog
        open={dialog?.open === true && (dialog.kind === "disable" || dialog.kind === "enable")}
        formKey={dialog?.id ?? 0}
        action={statusAction}
        member={dialog?.kind === "disable" || dialog?.kind === "enable" ? member : null}
        onDone={(action, saved, previous) =>
          done(action === "disable" ? `${personLabel(previous)} is disabled.` : `${personLabel(previous)} is active again.`, saved)
        }
        {...handlers}
      />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}

/** One action, or the reason it isn't available (still focusable, so the reason can be read). */
function ActionButton({ label, reason, onClick, testId }: { label: string; reason?: string; onClick?: () => void; testId: string }) {
  const tipId = useId();
  if (!reason) {
    return (
      <button type="button" onClick={onClick} data-testid={testId}>
        {label}
      </button>
    );
  }
  return (
    <span className="disabled-tip">
      <button type="button" aria-disabled="true" aria-describedby={tipId} data-testid={testId}>
        {label}
      </button>
      <span role="tooltip" id={tipId}>
        {reason}
      </span>
    </span>
  );
}

/** The actions for one admin: in the row's ••• menu, and in the details drawer (easier on a phone). */
function MemberActions({ member, self, onAction, variant }: { member: StaffMember; self: boolean; onAction: (kind: MemberAction, member: StaffMember) => void; variant: "menu" | "panel" }) {
  const reason = self ? SELF_REASON : undefined;
  const prefix = variant === "menu" ? "admin-action" : "details-action";
  const buttons = (
    <>
      <ActionButton label="Change roles" reason={reason} onClick={() => onAction("roles", member)} testId={`${prefix}-roles`} />
      {member.status === "ACTIVE" ? (
        <ActionButton label="Disable admin" reason={reason} onClick={() => onAction("disable", member)} testId={`${prefix}-disable`} />
      ) : (
        <ActionButton label="Re-enable admin" reason={reason} onClick={() => onAction("enable", member)} testId={`${prefix}-enable`} />
      )}
      <ActionButton label="Reset 2FA" reason={RESET_2FA_REASON} testId={`${prefix}-reset-2fa`} />
    </>
  );
  if (variant === "panel") return <div className="row-actions member-actions">{buttons}</div>;
  return (
    // Clicks here must not open the row's details drawer.
    <div className="row-menu-wrap" onClick={(event) => event.stopPropagation()}>
      <details
        className="row-menu"
        data-testid="admin-actions"
        onClick={(event) => {
          // Close the menu once an action is chosen.
          if ((event.target as HTMLElement).closest("button:not([aria-disabled=true])")) event.currentTarget.open = false;
        }}
      >
        <summary aria-label={`Actions for ${personLabel(member)}`} data-testid="admin-actions-toggle">
          •••
        </summary>
        <div>{buttons}</div>
      </details>
    </div>
  );
}

function MemberDetails({ member, self, onAction }: { member: StaffMember; self: boolean; onAction: (kind: MemberAction, member: StaffMember) => void }) {
  return (
    <div className="detail-stack" data-testid="admin-details" data-email={member.email}>
      <KeyValueList
        items={[
          { label: "Name", value: personName(member) || "No name on file" },
          { label: "Email", value: member.email },
          { label: "Roles", value: roleNames(member).join(", ") || "None" },
          { label: "Status", value: STATUS_LABEL[member.status] },
          { label: "2FA", value: member.two_factor_enrolled ? "Set up" : "Not set up yet: asked at their next sign-in" },
          { label: "Last login · UTC", value: lastLoginText(member) },
          { label: "Admin since · UTC", value: formatUtc(member.created_at) },
          { label: "Last changed · UTC", value: formatUtc(member.updated_at) },
          { label: "Admin ID", value: <code>{member.id}</code> },
        ]}
      />
      {self && <p className="ops-note">This is you. Another admin must change your roles or status.</p>}
      <MemberActions member={member} self={self} onAction={onAction} variant="panel" />
    </div>
  );
}
