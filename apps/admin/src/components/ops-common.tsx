"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ConfirmDialog, EmptyState, ReauthDialog, Skeleton, StatusChip, Toast, type FilterValue } from "@funded-hub/ui";
import type { OpsRecord, PageState } from "@/mocks/types";

export function PageHeading({title,section,description,action}:{title:string;section:string;description:string;action?:ReactNode}) {
 return <div className="page-heading"><div><span className="eyebrow">{section} / OPERATIONS</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function PageStateView({state,title,children}:{state:PageState;title:string;children:ReactNode}) {
 if(state==="loading") return <section className="panel state-panel" aria-busy="true"><h2>Loading {title.toLowerCase()}…</h2><p>Preparing the workspace view.</p><div className="state-kpis"><Skeleton variant="card"/><Skeleton variant="card"/><Skeleton variant="card"/></div><Skeleton variant="table"/></section>;
 if(state==="empty") return <section className="panel"><EmptyState title={"No "+title.toLowerCase()+" to display"} description="There are no records in this view. Change your filters or return when new records are available." action={<a className="button button-secondary" href="?">Show default preview</a>}/></section>;
 if(state==="error") return <section className="panel state-panel"><div className="inline-alert" role="alert"><StatusChip state="loss">Unable to load</StatusChip><h2>{title} is temporarily unavailable</h2><p>Your work has not been submitted. Retry the sample view or return to the dashboard.</p><div className="ops-actions"><a className="button button-secondary" href="?">Retry preview</a><Link className="quiet-link" href="/">Go to dashboard →</Link></div></div></section>;
 return children;
}
export function MetricStrip({items}:{items:readonly {label:string;value:string}[]}) {return <div className="ops-metrics">{items.map(item=><div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>;}
export function Checklist({items}:{items:readonly {label:string;passed:boolean;detail:string}[]}) {return <ul className="ops-checklist">{items.map(item=><li key={item.label}><span className={item.passed ? "check-pass" : "check-pending"} aria-label={item.passed ? "Passed" : "Needs attention"}>{item.passed ? "✓" : "!"}</span><div><strong>{item.label}</strong><span>{item.detail}</span></div></li>)}</ul>;}
export function useVisualAction() {
 const [pending,setPending]=useState<{title:string;consequence:string}|null>(null),[stage,setStage]=useState(""),[toast,setToast]=useState("");
 return {action:(title:string,consequence:string)=>{setPending({title,consequence});setStage("confirm");},notify:setToast,
 dialogs:<><ConfirmDialog open={stage==="confirm"} title={pending?.title??"Confirm action"} consequence={(pending?.consequence??"")+" This sample only previews the action; no records change."} confirmLabel="Continue to code entry" onClose={()=>setStage("")} onConfirm={()=>setStage("reauth")}/><ReauthDialog open={stage==="reauth"} onClose={()=>setStage("")} onComplete={()=>{setStage("");setToast("Sample · "+pending?.title+" previewed. No records changed.");}}/>{toast && <Toast message={toast} onClose={()=>setToast("")}/>}</>};
}
export function Timestamp({value}:{value:string|null}) {return value ? <time dateTime={value}>{new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23",timeZone:"UTC"}).format(new Date(value))} UTC</time> : <span>Never</span>;}
export function NoteField({label="Reason",required=true}:{label?:string;required?:boolean}) {return <label className="ops-field">{label}{required && " · required"}<textarea name="reason" required={required} rows={3} placeholder="Explain the decision for the audit record…" maxLength={1000}/></label>;}
export function matchesFilter(row:OpsRecord,filter:FilterValue) {return (!filter.search || [row.id,row.name,row.email,row.detail].join(" ").toLowerCase().includes(filter.search.toLowerCase()))&&(!filter.select||row.status===filter.select)&&(!filter.from||row.at.slice(0,10)>=filter.from)&&(!filter.to||row.at.slice(0,10)<=filter.to);}
export const noFilters:FilterValue={search:"",select:"",from:"",to:""};
