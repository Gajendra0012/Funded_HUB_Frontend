"use client";
import Link from "next/link";
import { CompactEquityChart } from "./compact-equity-chart";
import { DataTable, KeyValueList, StatusChip, Toast, UsageBar } from "@funded-hub/ui";
import { useState } from "react";
import type { DashboardData, Violation } from "@/mocks/types";

export const violationColumns = [
  { key:"account", header:"Account", cell:(row:Violation)=><code>{row.account}</code>, sortValue:(row:Violation)=>row.account },
  { key:"rule", header:"Rule", cell:(row:Violation)=>row.rule, sortValue:(row:Violation)=>row.rule },
  { key:"value", header:"Observed / limit", cell:(row:Violation)=><div className="observed-cell"><code>{row.value}</code><div className="observed-meter"><UsageBar label={row.account + " loss usage"} value={row.observed} limit={row.limit}/></div></div> },
  { key:"status", header:"Status", cell:(row:Violation)=><StatusChip state={row.state}>{row.status}</StatusChip>, sortValue:(row:Violation)=>row.status },
  { key:"time", header:"Time · UTC", cell:(row:Violation)=><time dateTime={row.at}>{row.at.slice(11,19)} UTC</time>, sortValue:(row:Violation)=>row.at }
];

export function ViolationDetails({row}:{row:Violation}) {
  return <><KeyValueList items={[
    {label:"Violation ID",value:<code>{row.id}</code>},
    {label:"Account",value:<code>{row.account}</code>},
    {label:"Rule",value:row.rule},
    {label:"Observed / limit",value:<code>{row.value}</code>},
    {label:"Status",value:<StatusChip state={row.state}>{row.status}</StatusChip>},
    {label:"Timestamp · UTC",value:<time>{row.at.replace("T"," ").replace("Z"," UTC")}</time>}
  ]}/></>;
}

export function Dashboard({data}:{data:DashboardData}) {
  const [message,setMessage]=useState("");
  return <>
    <div className="page-heading">
      <div><span className="eyebrow">OVERVIEW / OPERATIONS</span><h1>Dashboard </h1><p>UTC trading day {data.asOf.slice(0,10)} · 1,284 active accounts</p></div>
      <button onClick={()=>setMessage("Sample · report export previewed.")}>Export snapshot ↗</button>
    </div>
    <div className="dashboard-meta"><span>Operational snapshot</span><time dateTime={data.asOf}>Snapshot at {data.asOf.slice(11,16)} UTC</time></div>
    <section className="kpi-section" aria-label="Operational metrics"><div className="kpi-strip-header"><h2>Trading day metrics</h2><span>Compared with the prior period</span></div><div className="kpi-strip">{data.metrics.map(metric=><article key={metric.label}>
      <span>{metric.label}</span><strong>{metric.value}</strong>
      <div className="kpi-trend"><span className="kpi-delta" data-state={metric.deltaState}>{metric.delta}</span><svg className="kpi-sparkline" viewBox="0 0 72 30" role="img" aria-label={metric.label + " sample trend"}><polyline points={metric.sparkline}/></svg></div>
      <p>{metric.detail}</p>
    </article>)}</div></section>
    <div className="dashboard-grid">
      <section className="panel violations-panel">
        <div className="panel-header"><div><h2>Live violations feed </h2><p>Latest events · snapshot</p></div><Link href="/violations" className="quiet-link">All violations ↗</Link></div>
        <DataTable rows={data.violations} columns={violationColumns} label="Risk events" renderDetail={row=><ViolationDetails row={row}/>}/>
      </section>
      <section className="panel connection-panel">
        <div className="panel-header"><h2>Connection health</h2><Link href="/connection-health" className="quiet-link">Details ↗</Link></div>
        <div className="connection-list">{data.connections.map(connection=><div key={connection.name}>
          <div><strong>{connection.name}</strong><small>Checked {connection.checkedAt.slice(11,19)} UTC</small></div>
          <div><StatusChip state={connection.state}>{connection.status}</StatusChip><code>{connection.latency}</code></div>
        </div>)}</div>
        <div className="connection-note">Provider states · snapshot</div>
      </section>
    </div>
    <section className="action-section">
      <div className="section-heading"><h2>Needs your action</h2><span>Review queues</span></div>
      <div className="queue-grid">{data.queues.map(queue=><Link href={queue.href} key={queue.title} className="panel queue-card" data-urgent={queue.urgent}>
        <div><span className="queue-age">Oldest {queue.oldest}</span><span aria-hidden="true">↗</span></div>
        <strong>{queue.count}</strong><h3>{queue.title}</h3><p>{queue.detail}</p><span className="queue-link">Open queue →</span>
      </Link>)}</div>
    </section>
    <section className="panel equity-panel">
      <div className="equity-context"><h2>Equity at a glance</h2><p><code>{data.equityAccount}</code></p><span className="small-note">Equity index · starts at 100</span></div>
      <CompactEquityChart values={data.equity} floor={data.equityFloor} target={data.equityTarget} ticks={data.equityTicks} label={"Account equity · " + data.asOf.slice(0,10) + " UTC"}/>
    </section>
    {message && <Toast message={message} onClose={()=>setMessage("")}/>}
  </>;
}
