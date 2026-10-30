"use client";

import { useRef, useState } from "react";
import { Button } from "@funded-hub/ui";
import { usePreview } from "@/components/preview-provider";
import { formatTimestamp, type AuditEvent } from "@/lib/preview";

export default function AuditPage() {
  const { state } = usePreview();
  const [search,setSearch] = useState("");
  const [action,setAction] = useState("");
  const [from,setFrom] = useState("");
  const [to,setTo] = useState("");
  const [selected,setSelected] = useState<AuditEvent | null>(null);
  const detail = useRef<HTMLDialogElement>(null);
  const invalidDates = !!(from && to && from > to);
  const actions = [...new Set(state.events.map(event=>event.action))];
  const filtered = state.events.filter(event=> !invalidDates && `${event.actor} ${event.entity} ${event.ip}`.toLowerCase().includes(search.trim().toLowerCase()) && (!action || event.action===action) && (!from || event.at.slice(0,10)>=from) && (!to || event.at.slice(0,10)<=to));
  function clearFilters() { setSearch("");setAction("");setFrom("");setTo(""); }
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">EVERY ACTION, IN CONTEXT</span><h1>Audit log</h1><p>Follow what changed, who changed it, and the before and after.</p></div><span className="reference-tag">READ-ONLY EVENT VIEWER</span></div>
      <section className="panel"><div className="panel-header"><div><h2>Workspace activity <span className="count-tag">{state.events.length}</span></h2><p>Seeded sample events and actions from this preview session</p></div><Button variant="secondary" onClick={clearFilters}>Clear filters</Button></div><div className="filter-bar audit-filters"><div className="search-field"><label className="sr-only" htmlFor="audit-search">Search actor, entity or IP</label><span aria-hidden="true">⌕</span><input id="audit-search" className="field" placeholder="Search actor, entity or IP…" value={search} onChange={event=>setSearch(event.target.value)}/></div><label className="select-filter">Action<select value={action} onChange={event=>setAction(event.target.value)}><option value="">All actions</option>{actions.map(value=><option key={value}>{value}</option>)}</select></label><label className="select-filter">From · UTC<input type="date" value={from} onChange={event=>setFrom(event.target.value)}/></label><label className="select-filter">To · UTC<input type="date" value={to} onChange={event=>setTo(event.target.value)}/></label></div>
        {invalidDates && <p className="feedback feedback-error inline-feedback" role="alert">The start date must be on or before the end date.</p>}
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Audit events table"><table className="audit-table"><thead><tr><th scope="col">Time · UTC</th><th scope="col">Actor</th><th scope="col">Action</th><th scope="col">Entity</th><th scope="col">Source</th><th scope="col"><span className="sr-only">Details</span></th></tr></thead><tbody>{filtered.map(event=><tr key={event.id}><td className="mono-cell"><time dateTime={event.at}>{formatTimestamp(event.at)}</time></td><th scope="row">{event.actor}</th><td><span className="action-pill">{event.action}</span></td><td className="muted-cell mono-cell">{event.entity}</td><td className="muted-cell">{event.ip}</td><td><button className="table-link" aria-label={`View ${event.action} on ${event.entity}`} onClick={()=>{setSelected(event);detail.current?.showModal();}}>View ↗</button></td></tr>)}</tbody></table></div>
        {!filtered.length && <div className="empty-state"><strong>No events match these filters</strong><p>Try another actor, action or date range.</p><Button variant="secondary" onClick={clearFilters}>Show all events</Button></div>}
        <div className="panel-footnote">{filtered.length} events shown. Seed IPs use documentation-only addresses. This in-memory preview is not a durable or tamper-proof audit store.</div>
      </section>
      <dialog ref={detail} className="admin-dialog audit-dialog" aria-labelledby="event-title"><button className="dialog-close" aria-label="Close event details" onClick={()=>detail.current?.close()}>×</button><span className="eyebrow">EVENT DETAILS</span><h2 id="event-title">{selected?.action}</h2><p>{selected?.actor} · {formatTimestamp(selected?.at ?? null)} UTC</p><dl className="event-metadata"><div><dt>Entity</dt><dd>{selected?.entity}</dd></div><div><dt>Source</dt><dd>{selected?.ip}</dd></div></dl><div className="json-grid"><div><h3>Before</h3><pre>{JSON.stringify(selected?.before ?? null,null,2)}</pre></div><div><h3>After</h3><pre>{JSON.stringify(selected?.after ?? null,null,2)}</pre></div></div><Button variant="secondary" onClick={()=>detail.current?.close()}>Close details</Button></dialog>
    </>
  );
}
