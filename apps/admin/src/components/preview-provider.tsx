"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Toast } from "@funded-hub/ui";
import type { PreviewCommand } from "@/lib/preview";
import type { PreviewState, PreviewConfig } from "@/mocks/types";

type PreviewContextValue = { config:PreviewConfig; state:PreviewState; execute:(command:PreviewCommand)=>PreviewState; reset:()=>void };
const PreviewContext=createContext<PreviewContextValue|null>(null);
export function PreviewProvider({ children, data, config }: { children:ReactNode; data:PreviewState; config:PreviewConfig }) {
 const [message,setMessage]=useState("");
 return <PreviewContext.Provider value={{config,state:data,execute:()=>{setMessage("Sample · action previewed. No records were changed.");return data;},reset:()=>setMessage("Sample · the workspace is already showing the original records.")}}>{children}{message && <Toast message={message} onClose={()=>setMessage("")}/>}</PreviewContext.Provider>;
}
export function usePreview() {const context=useContext(PreviewContext);if(!context) throw new Error("Admin preview requires PreviewProvider.");return context;}
