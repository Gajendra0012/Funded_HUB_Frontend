"use client";

import { EmptyState } from "@funded-hub/ui";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useCursorList } from "@/lib/api/use-cursor-list";
import { buildRoleMatrix, type RoleMatrix } from "@/lib/roles";
import { useAdminApi } from "./admin-api-provider";
import { ApiErrorPanel } from "./api-error-panel";
import { LoadingPanel } from "./loading-panel";
import { LoadMore } from "./load-more";

/** The API's largest page: the backend has 4 roles, so they arrive in one answer. */
const ROLES_PAGE_SIZE = 100;

/** The live roles and what each one may do (ADM-05), from `GET /admin/roles`. Read only: the backend seeds the roles. */
export function RolesScreen() {
  const api = useAdminApi();
  const list = useCursorList("roles", (cursor, signal) =>
    api.get("/api/v1/admin/roles", { query: { limit: ROLES_PAGE_SIZE, cursor: cursor ?? undefined }, signal }),
  );

  if (list.status === "loading") return <LoadingPanel label="Loading roles" />;
  if (list.status === "error" && list.error) return <ApiErrorPanel error={list.error} onRetry={list.retry} />;
  if (!list.items.length) {
    return (
      <section className="panel">
        <EmptyState title="No roles found" description="The backend returned no roles. Its seed data may be missing: ask the backend engineer." />
      </section>
    );
  }
  return (
    <>
      <RoleMatrixView matrix={buildRoleMatrix(list.items)} />
      {(list.hasMore || list.status === "error-more") && (
        <LoadMore status={list.status} hasMore={list.hasMore} count={list.items.length} error={list.error} onLoadMore={list.loadMore} />
      )}
    </>
  );
}

export function RoleMatrixView({ matrix }: { matrix: RoleMatrix }) {
  const { roles, rows, unknownCodes } = matrix;
  return (
    <>
      <div className="role-card-grid">
        {roles.map((role, index) => (
          <article className="panel role-card" key={role.id} data-testid={`role-card-${role.code}`}>
            <span className="role-card-number">{String(index + 1).padStart(2, "0")}</span>
            <h2>{role.name}</h2>
            <p>{role.description ?? "No description."}</p>
            <span className="member-count">
              {role.permissions.length} of {PERMISSIONS.length} permissions
            </span>
          </article>
        ))}
      </div>
      {unknownCodes.length > 0 && (
        <div className="inline-alert role-matrix-alert" role="status" data-testid="roles-unknown">
          <p>
            The backend has {unknownCodes.length === 1 ? "a permission" : "permissions"} this admin app doesn&apos;t know yet:{" "}
            {unknownCodes.join(", ")}. They&apos;re listed at the end. Update the app&apos;s permission list (src/lib/auth/permissions.ts).
          </p>
        </div>
      )}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Permission matrix</h2>
            <p>
              {rows.length} permissions · {roles.length} roles · read only
            </p>
          </div>
          <span className="small-note">✓ Granted · — Not granted</span>
        </div>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Permission matrix">
          <table className="permission-table" data-testid="role-matrix">
            <caption className="ui-sr">Which of the {rows.length} permissions each role has</caption>
            <thead>
              <tr>
                <th scope="col">Permission</th>
                {roles.map((role) => (
                  <th scope="col" key={role.id}>
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} data-testid={`permission-row-${row.code}`} data-known={row.known}>
                  <th scope="row">
                    {row.label}
                    <code>{row.code}</code>
                  </th>
                  {row.granted.map((granted, index) => (
                    <td key={roles[index].id} data-granted={granted}>
                      <span className={granted ? "permission-yes" : "permission-no"} aria-hidden="true">
                        {granted ? "✓" : "—"}
                      </span>
                      <span className="ui-sr">{granted ? "Granted" : "Not granted"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footnote">
          Live from the backend, which checks these permissions on every request. Roles and their permissions are set by the backend and
          can&apos;t be changed here. To give someone a role, use Admin users.
        </div>
      </section>
    </>
  );
}
