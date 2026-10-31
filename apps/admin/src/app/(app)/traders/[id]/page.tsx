import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { notFound } from "next/navigation";
import { RecordDetails } from "@/components/operational-screen";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:PreviewSearch}) {const {id}=await params;const row=workspace.screens["traders"].records.find(item=>item.id===id);if(!row) notFound();const state=await pagePreview(searchParams);return <><PageHeading title="Trader 360" section={workspace.screens["traders"].section} description={row.id+" · "+row.name}/><PageStateView state={state} title="Trader 360"><section className="panel ops-panel"><RecordDetails kind="traders" row={row} data={workspace}/></section></PageStateView></>;}