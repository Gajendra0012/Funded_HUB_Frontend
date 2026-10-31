import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UsageBar, MiniEquityChart, JsonDiff, trapDialogFocus } from "../../../packages/ui/src/admin";
describe("admin UI semantics",()=>{
 it("marks safe, near-limit and breached loss usage without changing profit semantics",()=>{
  for(const [value,state] of [[20,"info"],[80,"caution"],[100,"loss"]] as const) expect(renderToStaticMarkup(createElement(UsageBar,{label:"Daily loss",value,limit:100}))).toContain('data-state="'+state+'"');
  expect(renderToStaticMarkup(createElement(UsageBar,{label:"Target",value:110,limit:100,kind:"profit-target"}))).toContain('data-state="info"');
 });
 it("labels chart floor breaches for nonvisual readers",()=>{const html=renderToStaticMarkup(createElement(MiniEquityChart,{values:[100,92,98],floor:95,target:110,label:"Sample equity"}));expect(html).toContain("floor breached");expect(html).toContain('class="ui-breach"');});
 it("highlights changed and removed fields, leaving unchanged fields plain",()=>{const html=renderToStaticMarkup(createElement(JsonDiff,{before:{status:"Pending",amount:10,removed:true},after:{status:"Approved",amount:10}}));expect(html.match(/data-changed="true"/g)).toHaveLength(4);expect(html.match(/data-changed="false"/g)).toHaveLength(2);expect(html).toContain("(absent)");});
 it("wraps focus at either end of a modal",()=>{
  let focused="";const first={hidden:false,getClientRects:()=>[1],focus:()=>{focused="first";}},last={hidden:false,getClientRects:()=>[1],focus:()=>{focused="last";}};
  const dialog={querySelectorAll:()=>[first,last]};const previous=Object.getOwnPropertyDescriptor(globalThis,"document");
  try {Object.defineProperty(globalThis,"document",{configurable:true,value:{activeElement:last}});let prevented=false;
   trapDialogFocus({key:"Tab",shiftKey:false,currentTarget:dialog,preventDefault:()=>{prevented=true;}} as unknown as Parameters<typeof trapDialogFocus>[0]);expect(focused).toBe("first");expect(prevented).toBe(true);
   Object.defineProperty(globalThis,"document",{configurable:true,value:{activeElement:first}});
   trapDialogFocus({key:"Tab",shiftKey:true,currentTarget:dialog,preventDefault:()=>{}} as unknown as Parameters<typeof trapDialogFocus>[0]);expect(focused).toBe("last");
  } finally {if(previous) Object.defineProperty(globalThis,"document",previous);else Reflect.deleteProperty(globalThis,"document");}
 });
});
