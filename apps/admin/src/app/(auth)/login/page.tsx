import { LoginPreview } from "@/components/login-preview";
import { Brand } from "@/components/brand";
import { PageStateView } from "@/components/ops-common";
import { workspace } from "@/mocks/workspace";
import { pagePreview, type PreviewSearch } from "@/lib/page-preview";
export default async function Page({searchParams}:{searchParams:PreviewSearch}) {const state=await pagePreview(searchParams);return state==="default" ? <LoginPreview data={workspace}/> : <section className="login-card"><Brand/><h1>Admin sign-in</h1><PageStateView state={state} title="Sign-in">{null}</PageStateView></section>;}
