import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView, MetricStrip } from "@/components/ops-common";
import { OperationalScreen } from "@/components/operational-screen";
import { ReportsScreen } from "@/components/setup-screens";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);const screen=workspace.screens["reports"];return <><PageHeading title={screen.title} section={screen.section} description={screen.description}/><PageStateView state={state} title={screen.title}><MetricStrip items={screen.metrics}/><div className="screen-stack"><ReportsScreen data={workspace}/><OperationalScreen kind="reports" data={workspace}/></div></PageStateView></>;}