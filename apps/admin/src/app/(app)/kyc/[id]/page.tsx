import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
import { PageHeading, PageStateView } from "@/components/ops-common";
import { notFound } from "next/navigation";
import { RecordDetails } from "@/components/operational-screen";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:PreviewSearch}) {const {id}=await params;const row=workspace.screens["kyc"].records.find(item=>item.id===id);if(!row) notFound();const state=await pagePreview(searchParams);return <><PageHeading title="KYC document review" section={workspace.screens["kyc"].section} description={row.id+" · "+row.name}/><PageStateView state={state} title="KYC document review"><section className="panel ops-panel"><RecordDetails kind="kyc" row={row} data={workspace}/></section></PageStateView></>;}