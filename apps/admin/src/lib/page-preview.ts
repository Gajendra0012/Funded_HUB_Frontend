import type { PageState } from "@/mocks/types";
export type PreviewSearch = Promise<Record<string,string|string[]|undefined>>;
// Temporary visual QA switch. Remove once the screen states are signed off.
export async function pagePreview(searchParams?:PreviewSearch):Promise<PageState> {
 if(process.env.NODE_ENV!=="development") return "default";
 const value=(await searchParams)?.state;
 return value==="loading"||value==="empty"||value==="error" ? value : "default";
}
