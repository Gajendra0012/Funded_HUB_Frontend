"use client";
import Link from "next/link";
import { useState } from "react";
import { DataTable, FilterBar, KeyValueList, StatusChip, UsageBar, type TableColumn } from "@funded-hub/ui";
import type { OpsRecord, WorkspaceMocks } from "@/mocks/types";
import { matchesFilter, noFilters, Timestamp, useVisualAction } from "./ops-common";
import { TradingDetails } from "./trading-details";
import { KycDetails, Trader360 } from "./people-details";
import { MoneyDetails } from "./money-details";
import { ProgramBuilder } from "./setup-screens";
export function RecordDetails({kind,row,data}:{kind:string;row:OpsRecord;data:WorkspaceMocks}) {
 const flow=useVisualAction();
 if(["risk-monitor","violations","pass-reviews","abuse-review"].includes(kind)) return <><TradingDetails kind={kind} row={row} data={data}/>{kind==="violations"&&<Link className="quiet-link" href={"/violations/"+row.id}>Open full violation ↗</Link>}</>;
 if(kind==="traders") return <><Trader360 row={row} data={data}/><Link className="quiet-link" href={"/traders/"+row.id}>Open Trader 360 ↗</Link></>;
 if(kind==="kyc") return <><KycDetails row={row} data={data}/><Link className="quiet-link" href={"/kyc/"+row.id}>Open full document review ↗</Link></>;
 if(kind==="programs") return <ProgramBuilder row={row} data={data}/>;
 if(kind==="connection-health") return <div className="detail-stack"><KeyValueList items={[{label:"Account",value:<code>{row.id}</code>},{label:"Trader",value:row.name},{label:"Stream",value:row.usage.stream},{label:"Lag",value:row.usage.lag},{label:"Last event · UTC",value:<Timestamp value={row.at}/>},{label:"Reconnect count",value:<code>{row.usage.reconnects}</code>} ]}/><button onClick={()=>flow.action("Reconnect stream","This would request a new stream subscription for this account.")}>Preview reconnect</button>{flow.dialogs}</div>;
 return <MoneyDetails kind={kind} row={row} data={data}/>;
}
export function OperationalScreen({kind,data}:{kind:string;data:WorkspaceMocks}) {
 const screen=data.screens[kind];const [filter,setFilter]=useState(noFilters);
 const rows=screen.records.filter(row=>matchesFilter(row,filter));
 let columns:TableColumn<OpsRecord>[]=screen.columns.map(col=>({key:col.key,header:col.label,sortValue:(row:OpsRecord)=>String(row[col.key]),cell:(row:OpsRecord)=>col.key==="status"?<StatusChip state={row.state}>{row.status}</StatusChip>:col.key==="at"?<Timestamp value={row.at}/>:col.mono?<code>{String(row[col.key])}</code>:<span>{String(row[col.key])}</span>}));
 if(kind==="risk-monitor") columns=[
 {key:"id",header:"Account",sortValue:(row:OpsRecord)=>row.id,cell:(row:OpsRecord)=><code>{row.id}</code>},
 {key:"name",header:"Trader",sortValue:(row:OpsRecord)=>row.name,cell:(row:OpsRecord)=><span>{row.name}</span>},
 {key:"status",header:"Risk state",sortValue:(row:OpsRecord)=>row.status,cell:(row:OpsRecord)=><StatusChip state={row.state}>{row.status}</StatusChip>},
 {key:"stream",header:"Connection",sortValue:(row:OpsRecord)=>row.usage.stream,cell:(row:OpsRecord)=><StatusChip state={row.usage.stream==="Delayed"?"caution":"profit"}>{row.usage.stream}</StatusChip>},
 {key:"daily",header:"Daily loss",sortValue:(row:OpsRecord)=>row.detail,cell:(row:OpsRecord)=><div className="risk-usage"><UsageBar label="Daily loss" value={row.usage.daily} limit={data.riskLimits.daily}/></div>},
 {key:"maximum",header:"Maximum loss",sortValue:(row:OpsRecord)=>row.detail,cell:(row:OpsRecord)=><div className="risk-usage"><UsageBar label="Maximum loss" value={row.usage.maxLoss} limit={data.riskLimits.maximum}/></div>},
 {key:"target",header:"Profit target",sortValue:(row:OpsRecord)=>row.detail,cell:(row:OpsRecord)=><div className="risk-usage"><UsageBar label="Profit target" value={row.usage.profit} limit={data.riskLimits.profit} kind="profit-target"/></div>},
 {key:"at",header:"Last event · UTC",sortValue:(row:OpsRecord)=>row.at,cell:(row:OpsRecord)=><Timestamp value={row.at}/>}
 ];
 if(kind==="connection-health") columns=[
 {key:"id",header:"Account",sortValue:(row:OpsRecord)=>row.id,cell:(row:OpsRecord)=><code>{row.id}</code>},
 {key:"status",header:"Stream status",sortValue:(row:OpsRecord)=>row.status,cell:(row:OpsRecord)=><StatusChip state={row.state}>{row.status}</StatusChip>},
 {key:"lag",header:"Lag",sortValue:(row:OpsRecord)=>row.detail,cell:(row:OpsRecord)=><code>{row.usage.lag}</code>},
 {key:"at",header:"Last event · UTC",sortValue:(row:OpsRecord)=>row.at,cell:(row:OpsRecord)=><Timestamp value={row.at}/>},
 {key:"reconnects",header:"Reconnect count",sortValue:(row:OpsRecord)=>row.detail,cell:(row:OpsRecord)=><code>{row.usage.reconnects}</code>}
 ];
 return <><section className={"panel ops-records "+(kind==="risk-monitor"?"risk-table":"")}><div className="panel-header"><h2>{screen.title} records</h2><span className="small-note">Snapshot <Timestamp value={data.now}/></span></div><FilterBar value={filter} onChange={setFilter} options={[...new Set(screen.records.map(row=>row.status))]}/><DataTable rows={rows} columns={columns} label={screen.title} renderDetail={row=><RecordDetails kind={kind} row={row} data={data}/>}/></section>{kind==="programs"&&<ProgramBuilder data={data} row={screen.records[1]}/>}</>;
}
