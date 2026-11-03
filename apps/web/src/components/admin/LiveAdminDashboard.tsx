"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "./AdminSignInPage";
import { ADMIN_NAV_GROUPS, AdminShell } from "./AdminShell";
import { AdminView } from "./AdminView";
import { getBrowserSupabase } from "@/lib/admin/browser";
import { sessionExpiresAt, sessionState, type SessionClaims } from "@/lib/admin/claims";
import { checkAdminEnv, readAdminEnv } from "@/lib/admin/env";

type Row = Record<string, unknown>;
type Page = { data: Row[]; meta?: { next_cursor?: string | null } };
const sections = {
  Staff: { path: "users", columns: ["email", "status", "roles"] },
  Roles: { path: "roles", columns: ["name", "code", "permissions"] },
  Traders: { path: "traders", columns: ["email", "country_code", "status", "kyc_status"] },
  Programs: { path: "programs", columns: ["name", "type", "status"] },
  Settings: { path: "settings", columns: ["key", "value", "description"] },
  Audit: { path: "audit-logs", columns: ["created_at", "action", "actor_id", "entity_type"] },
} as const;
type Section = keyof typeof sections | "Results";

const control = "rounded-lg border border-line px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50";

function display(value: unknown): string {
  if (Array.isArray(value)) return value.map(display).join(", ");
  if (typeof value === "object" && value !== null) {
    if ("name" in value && typeof value.name === "string") return value.name;
    return JSON.stringify(value);
  }
  return value == null ? "—" : String(value);
}

export function LiveAdminDashboard() {
  const { env } = checkAdminEnv(readAdminEnv());
  if (!env) redirect(ADMIN_LOGIN_PATH);
  return <AdminSession api={env.adminApiUrl} />;
}

function AdminSession({ api }: { api: string }) {
  const [session, setSession] = useState<{ token: string; expires: number } | null | undefined>();
  const refresh = useCallback(() => {
    void (async () => {
      const supabase = getBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSession(null);
        return;
      }
      const { data } = await supabase.auth.getClaims(session.access_token);
      const claims = (data?.claims ?? null) as SessionClaims | null;
      if (!claims || sessionState(claims, Math.floor(Date.now() / 1000)) !== "active") {
        if (claims && sessionState(claims, Math.floor(Date.now() / 1000)) === "expired") {
          await supabase.auth.signOut({ scope: "local" });
        }
        setSession(null);
        return;
      }
      setSession({ token: session.access_token, expires: (sessionExpiresAt(claims) ?? 0) * 1000 });
    })().catch(() => setSession(null));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const { data: { subscription } } = getBrowserSupabase().auth.onAuthStateChange(() => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 0);
    });
    return () => { clearTimeout(timer); subscription.unsubscribe(); };
  }, [refresh]);

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(refresh, Math.max(0, session.expires - Date.now()));
    return () => clearTimeout(timer);
  }, [refresh, session]);

  if (session === null) redirect(ADMIN_LOGIN_PATH);
  if (!session) return <p role="status" className="p-6 text-muted">Checking your session…</p>;

  const signOut = <button className={control} onClick={() => void getBrowserSupabase().auth.signOut({ scope: "local" })}>Sign out</button>;
  return <AdminShell live actions={signOut}>
    <AdminRecords api={api} token={session.token} />
  </AdminShell>;
}

function AdminRecords({ api, token }: { api: string; token: string }) {
  const [section, setSection] = useState<Section>("Programs");
  const [unavailable, setUnavailable] = useState<string | undefined>("Dashboard");
  const [program, setProgram] = useState<Row | null>(null);
  const [rules, setRules] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const [page, setPage] = useState<Page>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const definition = section === "Results" ? null : sections[section];
  const path = unavailable ? undefined : program ? (rules ? "rule-sets" : "programs/" + encodeURIComponent(String(program.id))) : definition?.path;
  const columns = program && rules ? ["name", "version", "status"] : definition?.columns;

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    const url = new URL("/api/v1/admin/" + path, api);
    if (rules && program) url.searchParams.set("program_id", String(program.id));
    if (cursor) url.searchParams.set("cursor", cursor);
    void fetch(url, {
      headers: { Authorization: "Bearer " + token },
      signal: controller.signal,
      cache: "no-store",
    }).then(async response => {
      if (response.status === 403) throw new Error("Your account does not have permission to view this section.");
      if (response.status === 401) throw new Error("Your session was rejected. Sign out and sign in again.");
      if (!response.ok) throw new Error("The API returned an error (" + response.status + ").");
      const payload = await response.json() as { data: Row[] | Row; meta?: Page["meta"] };
      if (!controller.signal.aborted) setPage({ data: Array.isArray(payload.data) ? payload.data : [payload.data], meta: payload.meta });
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof TypeError ? "Could not reach the admin API. Check the backend URL and allowed origin." : cause instanceof Error ? cause.message : "Could not load this section.");
    });
    return () => controller.abort();
  }, [api, cursor, path, program, retry, rules, token]);

  function clearPage() {
    setPage(undefined);
    setError("");
  }

  useEffect(() => {
    function navigate() {
      const key = window.location.hash.slice(1) || "overview";
      const target = ([...Object.keys(sections), "Results"] as Section[])
        .find(item => item.toLowerCase() === key);
      const item = ADMIN_NAV_GROUPS.flatMap(group => [...group.items]).find(([, id]) => id === key);
      if (!item) return;
      const next = target ?? (key === "rule-sets" ? "Programs" : undefined);
      setUnavailable(next ? undefined : item[0]);
      if (next) setSection(next);
      setProgram(null);
      setRules(false);
      setCursor(undefined);
      setPage(undefined);
      setError("");
    }
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  if (unavailable === "Dashboard") {
    return <AdminView sampleLabel />;
  }

  return <>
    <section className="card space-y-4 rounded-2xl p-5">
      <h2 className="text-xl font-semibold">{unavailable ?? (program ? display(program.name) + (rules ? " · Rule versions" : " · Program details") : section)}</h2>
      {program && <div className="flex flex-wrap gap-2">
        <button className={control} onClick={() => { setProgram(null); setRules(false); setCursor(undefined); clearPage(); }}>Back to programs</button>
        <button className={control} onClick={() => { setRules(!rules); setCursor(undefined); clearPage(); }}>{rules ? "Program details" : "Rule versions"}</button>
      </div>}
      {unavailable ? <p className="text-muted">This section has no live data endpoint connected.</p> : section === "Results" ? <p className="text-muted">Live rule-engine results are unavailable. The backend currently exposes rule configurations, but has no results API for evaluated accounts.</p>
      : error ? <div className="space-y-3"><p role="alert">{error}</p><button className={control} onClick={() => { clearPage(); setRetry(retry + 1); }}>Retry</button></div>
      : !page ? <p role="status">Loading {section.toLowerCase()}…</p>
      : !page.data.length ? <p className="text-muted">No records returned.</p>
      : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr>{columns?.map(column => <th key={column} scope="col" className="p-3 capitalize">{column.replaceAll("_", " ")}</th>)}<th scope="col" className="p-3">Record</th></tr></thead>
        <tbody>{page.data.map((row, index) => <tr key={String(row.id ?? row.key ?? index)} className="border-t border-line align-top">
          {columns?.map(column => <td key={column} className="max-w-72 break-words p-3">{display(row[column])}</td>)}
          <td className="p-3">{section === "Programs" && !program ? <button className={control} onClick={() => { setProgram(row); setCursor(undefined); clearPage(); }}>Open program</button>
          : <details><summary className="cursor-pointer">View data</summary><pre className="mt-2 max-w-lg whitespace-pre-wrap break-all text-xs">{JSON.stringify(row, null, 2)}</pre></details>}</td>
        </tr>)}</tbody>
      </table></div>}
      {page?.meta?.next_cursor && <button className={control} onClick={() => { setCursor(page.meta?.next_cursor ?? undefined); clearPage(); }}>Next page</button>}
    </section>
  </>;
}
