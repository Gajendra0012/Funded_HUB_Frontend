import { Dashboard } from "@/components/dashboard";
import { dashboard } from "@/mocks/admin";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);return state==="default" ? <Dashboard data={dashboard}/> : <><PageHeading title="Dashboard" section="Overview" description="Operational snapshot of the UTC trading day."/><PageStateView state={state} title="Dashboard">{null}</PageStateView></>;}
