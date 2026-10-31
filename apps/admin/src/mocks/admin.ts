import { SAMPLE_NOW, sampleAt } from "./now";
import type { DashboardData, NavGroup } from "./types";
export const navigation:NavGroup[] = [
 {label:"Overview",items:[{label:"Dashboard",href:"/",icon:"grid"}]},
 {label:"Trading",items:[{label:"Risk monitor",href:"/risk-monitor",icon:"pulse"},{label:"Violations",href:"/violations",icon:"flag"},{label:"Pass reviews",href:"/pass-reviews",icon:"check"},{label:"Abuse review",href:"/abuse-review",icon:"shield"}]},
 {label:"People",items:[{label:"Traders",href:"/traders",icon:"people"},{label:"KYC queue",href:"/kyc",icon:"check"},{label:"Admin users",href:"/admin-users",icon:"people"},{label:"Roles",href:"/roles",icon:"shield"}]},
 {label:"Money",items:[{label:"Orders",href:"/orders",icon:"receipt"},{label:"Refunds",href:"/refunds",icon:"return"},{label:"Payouts",href:"/payouts",icon:"arrow"},{label:"Liability",href:"/liability",icon:"chart"},{label:"Affiliates",href:"/affiliates",icon:"link"},{label:"Discount codes",href:"/discount-codes",icon:"tag"}]},
 {label:"Setup",items:[{label:"Programs",href:"/programs",icon:"grid"},{label:"Rule sets",href:"/rule-sets",icon:"list"},{label:"Instruments",href:"/instruments",icon:"chart"},{label:"Settings",href:"/settings",icon:"settings"}]},
 {label:"System",items:[{label:"Audit log",href:"/audit-log",icon:"list"},{label:"Connection health",href:"/connection-health",icon:"pulse"},{label:"Reports",href:"/reports",icon:"receipt"}]}
];
export const identity = { name:"Alex Morgan", initials:"AM", role:"Admin", environment:"Staging", session:"11:42", now:SAMPLE_NOW };
export const dashboard:DashboardData = {
 asOf:SAMPLE_NOW,
 metrics:[{label:"Sales",value:"$48,920",detail:"142 orders · last 24 hours",delta:"+8.4%",deltaState:"profit",sparkline:"0,24 10,20 20,22 30,14 40,17 50,9 60,11 70,4"},{label:"Active accounts",value:"1,284",detail:"Across all evaluation phases",delta:"+42",deltaState:"profit",sparkline:"0,25 10,23 20,18 30,20 40,12 50,14 60,6 70,3"},{label:"Pass rate",value:"18.6%",detail:"Last 30 days · 86 passed",delta:"+1.2 pp",deltaState:"profit",sparkline:"0,24 10,21 20,23 30,13 40,17 50,10 60,11 70,5"},{label:"Pending payouts",value:"$24,650",detail:"12 requests awaiting review",delta:"−$3,200",deltaState:"profit",sparkline:"0,4 10,8 20,6 30,15 40,12 50,20 60,18 70,26"},{label:"Liability",value:"$186,420",detail:"Estimated eligible rewards",delta:"+$6,840",deltaState:"loss",sparkline:"0,25 10,22 20,24 30,15 40,18 50,12 60,8 70,3"}],
 violations:[
 {id:"VIO-1048",account:"ACC-08142",rule:"Daily loss limit",value:"5.12% / 5.00%",observed:5.12,limit:5,at:sampleAt(8),state:"loss",status:"Breached"},
 {id:"VIO-1047",account:"ACC-06281",rule:"Max loss approaching",value:"8.64% / 10.00%",observed:8.64,limit:10,at:sampleAt(102),state:"caution",status:"Near limit"},
 {id:"VIO-1046",account:"ACC-09103",rule:"Daily loss approaching",value:"4.21% / 5.00%",observed:4.21,limit:5,at:sampleAt(236),state:"caution",status:"Near limit"},
 {id:"VIO-1045",account:"ACC-07219",rule:"Daily loss limit",value:"5.04% / 5.00%",observed:5.04,limit:5,at:sampleAt(374),state:"loss",status:"Breached"},
 {id:"VIO-1044",account:"ACC-05384",rule:"Risk review complete",value:"2.10% / 5.00%",observed:2.1,limit:5,at:sampleAt(580),state:"neutral",status:"Resolved"}
 ],
 connections:[{name:"Bybit Demo",state:"profit",status:"Healthy",latency:"84 ms",checkedAt:sampleAt(0)},{name:"Account sync",state:"profit",status:"Healthy",latency:"1.2 s",checkedAt:sampleAt(0)},{name:"Price stream",state:"caution",status:"Delayed",latency:"3.8 s",checkedAt:sampleAt(0)},{name:"Webhooks",state:"profit",status:"Healthy",latency:"126 ms",checkedAt:sampleAt(0)},{name:"Email",state:"profit",status:"Healthy",latency:"240 ms",checkedAt:sampleAt(0)},{name:"Storage",state:"profit",status:"Healthy",latency:"32 ms",checkedAt:sampleAt(0)}],
 queues:[{title:"Payout reviews",count:"12",oldest:"2h",urgent:false,detail:"$24,650 awaiting review",href:"/payouts"},{title:"Pass reviews",count:"08",oldest:"48m",urgent:false,detail:"Evaluations ready for a decision",href:"/pass-reviews"},{title:"KYC queue",count:"06",oldest:"3h",urgent:false,detail:"Documents waiting for review",href:"/kyc-queue"},{title:"Abuse flags",count:"03",oldest:"5h",urgent:true,detail:"Accounts requiring investigation",href:"/abuse-review"}],
 equity:[100,101,100,103,102,104,106,103,105,107,106,109],
 equityAccount:"ACC-08142",equityFloor:95,equityTarget:110,equityTicks:[{at:sampleAt(63720),position:0},{at:sampleAt(42120),position:.339},{at:sampleAt(20520),position:.678},{at:sampleAt(0),position:1}]
};
export const gallery = {
 states:["profit","loss","caution","info","neutral"] as const, roles:["Admin","Risk","Support","Finance"], breachEquity:[100,101,99,96,92,96], safeUsage:{label:"Daily loss · safe",value:1200,limit:5000},
 options:["Breached","Near limit","Resolved"],
 before:{status:"Pending",reviewer:null,amount:2400},after:{status:"Approved",reviewer:"Alex Morgan",amount:2400},
 timeline:[{id:"1",title:"Request created",at:sampleAt(5520),description:"Sample payout request received."},{id:"2",title:"Review started",at:sampleAt(1320),description:"Assigned to the finance queue."}],
 steps:["Requested","In review","Completed"], secret:"sample-key-08142", usage:[{label:"Profit target",value:6400,limit:10000,kind:"profit-target" as const},{label:"Daily loss",value:4200,limit:5000,kind:"daily-loss" as const},{label:"Maximum loss",value:10200,limit:10000,kind:"max-loss" as const}]
};
