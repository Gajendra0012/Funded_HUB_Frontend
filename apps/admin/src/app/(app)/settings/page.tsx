import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { SettingsScreen } from "@/components/settings-screen";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);return <><PageHeading title="Settings" section="Setup" description="Review restricted-country policy changes before confirming."/><PageStateView state={state} title="Settings"><SettingsScreen data={workspace}/></PageStateView></>;}