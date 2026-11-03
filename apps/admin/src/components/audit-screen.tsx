"use client";

import { useState, type ReactNode } from "react";
import { DataTable, JsonDiff, KeyValueList, type TableColumn } from "@funded-hub/ui";
import { MEMBERS_PAGE_SIZE, personLabel, sortMembers } from "@/lib/admin-users";
import { formatUtc } from "@/lib/api/format";
import { cleanQuery, queryKey } from "@/lib/api/paging";
import type { ApiResult, PageMeta } from "@/lib/api/types";
import { useCursorList, useDebouncedValue } from "@/lib/api/use-cursor-list";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  AUDIT_PAGE_SIZE,
  actionLabel,
  actorLabel,
  actorNames,
  asRecord,
  changedFirst,
  changedKeys,
  displayIp,
  entityTypeLabel,
  filterByIp,
  isUuid,
  recordName,
  utcRange,
  type ActorNames,
  type AuditRecord,
} from "@/lib/audit";
import { useAdminApi } from "./admin-api-provider";
import { ApiErrorPanel } from "./api-error-panel";
import { LoadingPanel } from "./loading-panel";
import { LoadMore } from "./load-more";

type Filters = { actor: string; action: string; entity: string; fromDay: string; toDay: string; ip: string };
const NO_FILTERS: Filters = { actor: "", action: "", entity: "", fromDay: "", toDay: "", ip: "" };
const NO_ENTRIES: ApiResult<AuditRecord[], PageMeta> = { ok: true, status: 200, data: [], meta: { next_cursor: null } };
const ACTOR_TYPE: Record<AuditRecord["actor_type"], string> = { ADMIN: "Admin", USER: "Trader", SYSTEM: "System" };
const ACTION_GROUPS = [...new Set(AUDIT_ACTIONS.map((action) => action.group))];

/**
 * The audit log (ADM-35), live: every change made through the admin API, newest first, read only.
 * Filters by who, action, record type and UTC dates on the server; by IP on the loaded entries (gap G6).
 */
export function AuditScreen() {
  const api = useAdminApi();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const set = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));

  // Names for admin IDs (gap G6): only admins who may manage admins can load the admin list.
  const admins = useCursorList("audit-admins", (cursor, signal) =>
    api.get("/api/v1/admin/users", { query: { limit: MEMBERS_PAGE_SIZE, cursor: cursor ?? undefined }, signal }),
  );
  const names: ActorNames | null = admins.status === "ready" ? actorNames(admins.items) : null;

  // The server's filters, sent once typing stops. A filter that can't be valid is explained, not sent.
  const typed = useDebouncedValue(filters, 300);
  const actor = typed.actor.trim();
  const range = utcRange(typed.fromDay, typed.toDay);
  const filterError =
    actor && !isUuid(actor) ? "Enter a whole admin ID, for example 3cddad6e-4f50-43f1-a967-828add539b75." : (range.error ?? "");
  const query = cleanQuery({ actor_id: actor, action: typed.action, entity_type: typed.entity, from: range.from, to: range.to });
  const list = useCursorList(queryKey({ ...query, invalid: filterError ? 1 : null }), (cursor, signal) =>
    filterError
      ? Promise.resolve(NO_ENTRIES)
      : api.get("/api/v1/admin/audit-logs", { query: { ...query, limit: AUDIT_PAGE_SIZE, cursor: cursor ?? undefined }, signal }),
  );

  // A user whose roles don't include audit.read: the shared "no permission" panel.
  if (list.status === "error" && list.error?.code === "FORBIDDEN") return <ApiErrorPanel error={list.error} />;

  const rows = filterByIp(list.items, filters.ip);
  const columns: TableColumn<AuditRecord>[] = [
    {
      key: "time",
      header: "Time · UTC",
      cell: (entry) => <time dateTime={entry.created_at}>{formatUtc(entry.created_at)}</time>,
      sortValue: (entry) => entry.created_at,
    },
    { key: "actor", header: "Who", cell: (entry) => actorLabel(entry, names) },
    {
      key: "action",
      header: "Action",
      cell: (entry) => (
        <span className="audit-cell">
          {actionLabel(entry)}
          <code>{entry.action}</code>
        </span>
      ),
    },
    {
      key: "record",
      header: "Record",
      cell: (entry) => (
        <span className="audit-cell">
          {entityTypeLabel(entry.entity_type)}
          <code>{recordName(entry)}</code>
        </span>
      ),
    },
    { key: "ip", header: "IP", cell: (entry) => <code>{displayIp(entry.ip)}</code> },
  ];
  const filtered = Boolean(query.actor_id || query.action || query.entity_type || query.from || query.to || filters.ip.trim());

  let body: ReactNode;
  if (filterError) {
    body = (
      <p className="inline-alert audit-filter-error" role="alert" data-testid="audit-filter-error">
        {filterError}
      </p>
    );
  } else if (list.status === "loading") {
    body = <LoadingPanel label="Loading the audit log" inline />;
  } else if (list.status === "error" && list.error) {
    body = <ApiErrorPanel error={list.error} onRetry={list.retry} inline />;
  } else {
    body = (
      <DataTable
        rows={rows}
        columns={columns}
        label="Audit entries"
        rowLabel={(entry) => `Open details: ${actionLabel(entry)}, ${formatUtc(entry.created_at)}`}
        rowTestId={(entry) => `audit-row-${entry.id}`}
        detailTitle="Audit entry"
        empty={
          filtered
            ? { title: "No entries match", description: "Try changing or clearing the filters." }
            : { title: "No audit entries yet", description: "Changes made in the admin app show up here." }
        }
        renderDetail={(entry) => <AuditDetails entry={entry} names={names} />}
      />
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Activity</h2>
          <p>Every change made through the admin API, newest first</p>
        </div>
        <span className="small-note">Read only · entries can&apos;t be edited or deleted</span>
      </div>
      <div className="audit-filter-grid">
        <label className="ops-field">
          Who
          {names ? (
            <select name="audit-actor" value={filters.actor} onChange={(event) => set({ actor: event.target.value })} data-testid="audit-filter-actor">
              <option value="">Anyone</option>
              {sortMembers(admins.items).map((member) => (
                <option key={member.id} value={member.id}>
                  {personLabel(member)} ({member.email})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="audit-actor"
              value={filters.actor}
              onChange={(event) => set({ actor: event.target.value })}
              placeholder="Admin ID…"
              autoComplete="off"
              spellCheck={false}
              data-testid="audit-filter-actor"
            />
          )}
        </label>
        <label className="ops-field">
          Action
          <select name="audit-action" value={filters.action} onChange={(event) => set({ action: event.target.value })} data-testid="audit-filter-action">
            <option value="">Any action</option>
            {ACTION_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {AUDIT_ACTIONS.filter((action) => action.group === group).map((action) => (
                  <option key={action.code} value={action.code}>
                    {action.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="ops-field">
          Record
          <select name="audit-entity" value={filters.entity} onChange={(event) => set({ entity: event.target.value })} data-testid="audit-filter-entity">
            <option value="">Any record</option>
            {AUDIT_ENTITY_TYPES.map((type) => (
              <option key={type.code} value={type.code}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="ops-field">
          From · UTC
          <input type="date" name="audit-from" value={filters.fromDay} max={filters.toDay || undefined} onChange={(event) => set({ fromDay: event.target.value })} data-testid="audit-filter-from" />
        </label>
        <label className="ops-field">
          To · UTC
          <input type="date" name="audit-to" value={filters.toDay} min={filters.fromDay || undefined} onChange={(event) => set({ toDay: event.target.value })} data-testid="audit-filter-to" />
        </label>
        <label className="ops-field">
          IP address
          <input
            type="search"
            name="audit-ip"
            value={filters.ip}
            onChange={(event) => set({ ip: event.target.value })}
            placeholder="127.0.0.1…"
            autoComplete="off"
            spellCheck={false}
            data-testid="audit-filter-ip"
          />
        </label>
      </div>
      <div className="audit-filter-footer">
        <button type="button" onClick={() => setFilters(NO_FILTERS)} data-testid="audit-clear">
          Clear all
        </button>
        {admins.status === "error" && admins.error?.code === "FORBIDDEN" && (
          <span className="small-note" data-testid="audit-names-note">
            Names need the permission to manage admins, so you see admin IDs.
          </span>
        )}
        {filters.ip.trim() && list.hasMore && (
          <span className="small-note" data-testid="audit-ip-note">
            The IP filter covers the {list.items.length} entries loaded so far. Load more to check older ones.
          </span>
        )}
      </div>
      {body}
      {!filterError && <LoadMore status={list.status} hasMore={list.hasMore} count={rows.length} error={list.error} onLoadMore={list.loadMore} />}
      <p className="panel-footnote">Sign-ins aren&apos;t listed here: Supabase records them. All times are UTC.</p>
    </section>
  );
}

/** One entry in full: who, what, where from, and the record before and after the change. */
export function AuditDetails({ entry, names }: { entry: AuditRecord; names: ActorNames | null }) {
  const actor = entry.actor_id ? names?.get(entry.actor_id) : undefined;
  const keys = changedKeys(entry.before_data, entry.after_data);
  const change =
    entry.before_data === null ? "New record" : entry.after_data === null ? "Record removed" : keys.length ? `Changed: ${keys.join(", ")}` : "No field changed";
  return (
    <div className="detail-stack" data-testid="audit-details" data-entry={entry.id}>
      <KeyValueList
        items={[
          { label: "Time · UTC", value: formatUtc(entry.created_at) },
          { label: "Who", value: actor ? `${actor.name} (${actor.email})` : actorLabel(entry, names) },
          { label: "Actor type", value: ACTOR_TYPE[entry.actor_type] },
          { label: "Actor ID", value: entry.actor_id ? <code>{entry.actor_id}</code> : "—" },
          {
            label: "Action",
            value: (
              <>
                {actionLabel(entry)} <code>{entry.action}</code>
              </>
            ),
          },
          { label: "Record", value: `${entityTypeLabel(entry.entity_type)} · ${recordName(entry)}` },
          { label: "Record ID", value: entry.entity_id ? <code>{entry.entity_id}</code> : "—" },
          { label: "IP address", value: <code>{displayIp(entry.ip)}</code> },
          { label: "Browser", value: entry.user_agent ?? "—" },
          { label: "Request ID", value: entry.request_id ? <code>{entry.request_id}</code> : "—" },
          { label: "Entry ID", value: <code>{entry.id}</code> },
        ]}
      />
      <p className="audit-change" data-testid="audit-change">
        {change}
      </p>
      <JsonDiff before={changedFirst(asRecord(entry.before_data), keys)} after={changedFirst(asRecord(entry.after_data), keys)} />
    </div>
  );
}
