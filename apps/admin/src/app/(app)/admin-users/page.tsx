import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { AdminUsersScreen } from "@/components/admin-users-screen";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);return <><PageHeading title="Admin users" section="People" description="Manage staff roles and enrollment status."/><PageStateView state={state} title="Admin users"><AdminUsersScreen data={workspace}/></PageStateView></>;}