import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { notFound } from "next/navigation";
import { RecordDetails } from "@/components/operational-screen";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:PreviewSearch}) {const {id}=await params;const row=workspace.screens["orders"].records.find(item=>item.id===id);if(!row) notFound();const state=await pagePreview(searchParams);return <><PageHeading title="Order detail" section={workspace.screens["orders"].section} description={row.id+" · "+row.name}/><PageStateView state={state} title="Order detail"><section className="panel ops-panel"><RecordDetails kind="orders" row={row} data={workspace}/></section></PageStateView></>;}