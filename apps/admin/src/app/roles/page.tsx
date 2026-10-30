"use client";

import { usePreview } from "@/components/preview-provider";
import { permissionMatrix, roles } from "@/lib/preview";

const descriptions = ["Platform ownership and access administration.","Risk oversight, rule publishing and investigation.","Trader assistance, KYC and content operations.","Payments, payout reviews and financial reporting."];

export default function RolesPage() {
  const { state } = usePreview();
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">ACCESS, WITH INTENTION</span><h1>Roles & permissions</h1><p>A read-only view of the team’s planned access boundaries.</p></div><span className="reference-tag">SPRINT 1 / REFERENCE MATRIX</span></div>
      <div className="role-card-grid">{roles.map((role,index)=><article className="panel role-card" key={role}><span className="role-card-number">0{index+1}</span><h2>{role}</h2><p>{descriptions[index]}</p><span className="member-count">{state.users.filter(user=>user.roles.includes(role)).length} sample members</span></article>)}</div>
      <section className="panel"><div className="panel-header"><div><h2>Permission matrix</h2><p>From the Sprint 1 Detailed Plan, pages 10–11</p></div><span className="small-note">✓ Planned access · — Not granted</span></div><div className="table-scroll" tabIndex={0} role="region" aria-label="Permission matrix"><table className="permission-table"><thead><tr><th scope="col">Capability</th>{roles.map(role=><th scope="col" key={role}>{role}</th>)}</tr></thead><tbody>{permissionMatrix.map(permission=><tr key={permission.label}><th scope="row">{permission.label}</th>{roles.map(role=><td key={role}><span className={permission.allowed.includes(role) ? "permission-yes" : "permission-no"} aria-label={permission.allowed.includes(role) ? "Allowed" : "Not granted"}>{permission.allowed.includes(role) ? "✓" : "—"}</span></td>)}</tr>)}</tbody></table></div><div className="panel-footnote">Display only. This matrix does not grant or enforce access. Production permissions must be checked by the backend on every request.</div></section>
    </>
  );
}
