import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { AuditScreen } from "@/components/audit-screen";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);return <><PageHeading title="Audit log" section="System" description="Actor, action and before-and-after context for sample events."/><PageStateView state={state} title="Audit log"><AuditScreen data={workspace}/></PageStateView></>;}