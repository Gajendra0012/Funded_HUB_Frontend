import type { StatusState } from "@funded-hub/ui";
export type Role = "Admin" | "Risk" | "Support" | "Finance";
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: "Active" | "Invited" | "Disabled";
  twoFactor: "Enrolled" | "Setup required";
  lastLogin: string | null;
};
export type Settings = { platformName: string; supportEmail: string; restrictedCountries: string[] };
export type AuditEvent = { id: string; at: string; actor: string; action: string; entity: string; ip: string; before: unknown; after: unknown };
export type PreviewState = { users: AdminUser[]; events: AuditEvent[]; settings: Settings };

export type NavGroup = { label:string; items:{label:string;href:string;icon:string}[] };
export type Metric = { label:string; value:string; detail:string; delta:string; deltaState:"profit"|"loss"; sparkline:string };
export type Violation = { id:string; account:string; rule:string; value:string; observed:number; limit:number; at:string; state:StatusState; status:string };
export type Connection = { name:string; state:StatusState; status:string; latency:string; checkedAt:string };
export type Queue = { title:string; count:string; detail:string; href:string; oldest:string; urgent:boolean };
export type EquityTick = { at:string; position:number };
export type DashboardData = { metrics:Metric[]; violations:Violation[]; connections:Connection[]; queues:Queue[]; equity:number[]; equityAccount:string; equityFloor:number; equityTarget:number; equityTicks:EquityTick[]; asOf:string };

export type PreviewConfig = {roles:readonly Role[];countryOptions:{code:string;name:string}[];permissionMatrix:{label:string;allowed:readonly Role[]}[];currentPreviewUser:string;descriptions:string[]};

export type UserInput = Pick<AdminUser, "name" | "email" | "roles">;
export type PreviewCommand =
  | { type: "create-user"; user: UserInput }
  | { type: "update-user"; id: string; user: UserInput }
  | { type: "toggle-user"; id: string }
  | { type: "save-settings"; settings: Settings };


export type PageState = "default" | "loading" | "empty" | "error";
export type RecordState = "profit" | "loss" | "caution" | "info" | "neutral";
export type OpsRecord = {usage:{daily:number;maxLoss:number;profit:number;lag:string;stream:string;reconnects:number};id:string;name:string;email:string;status:string;state:RecordState;at:string;amount:string;detail:string;trader:string;account:string;ip:string};
export type ScreenData = {title:string;section:string;description:string;records:OpsRecord[];columns:{key:keyof OpsRecord;label:string;mono?:boolean}[];metrics:{label:string;value:string}[]};
export type RuleGroup = {title:string;rules:{id:string;label:string;value:string;unit:string;description:string}[]};
export type WorkspaceMocks = {
 now:string;roles:readonly Role[];currentAdminId:string;
 violationSnapshots:Record<string,{facts:{label:string;value:string}[];value:number;limit:number;equity:number[];floor:number;target:number}>;identityFacts:{country:string;document:string;birth:string;address:string};
 paymentFacts:{expected:string;network:string;confirmations:string};payoutBreakdown:Record<string,{label:string;value:string}[]>;
 riskLimits:{daily:number;maximum:number;profit:number};discountCap:number;liabilityAllocation:string;users:AdminUser[];
 permissions:{label:string;allowed:readonly Role[]}[];roleDescriptions:readonly string[];
 countries:{code:string;name:string}[];restrictedCountries:string[];updatedBy:string;updatedAt:string;
 audit:AuditEvent[];screens:Record<string,ScreenData>;risk:OpsRecord[];
 checks:{label:string;passed:boolean;detail:string}[];payoutChecks:{label:string;passed:boolean;detail:string}[];
 timeline:{id:string;title:string;at:string;description:string}[];
 evidence:{label:string;value:string}[];documents:{id:string;title:string;description:string}[];
 backupCodes:string[];manualKey:string;ruleGroups:RuleGroup[];
 ruleBefore:Record<string,unknown>;ruleAfter:Record<string,unknown>;
 reportTypes:readonly string[];pairs:{pair:string;leverage:number;enabled:boolean}[];
 programPhaseCount:Record<string,number>;accountSizes:{size:string;price:string}[];addOns:readonly string[];
 equity:number[];breachEquity:number[];sampleHash:string;wallet:string;
};
