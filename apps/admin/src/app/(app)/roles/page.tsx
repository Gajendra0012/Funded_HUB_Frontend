import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { RolesScreen } from "@/components/roles-screen";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);return <><PageHeading title="Roles" section="People" description="Read-only permissions across the admin workspace."/><PageStateView state={state} title="Roles"><RolesScreen data={workspace}/></PageStateView></>;}