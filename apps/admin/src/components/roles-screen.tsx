"use client";

import type { WorkspaceMocks } from "@/mocks/types";




export function RolesScreen({data}:{data:WorkspaceMocks}) {
  const roles=data.roles, permissionMatrix=data.permissions, descriptions=data.roleDescriptions; const state={users:data.users};
  return (
    <>
      <div className="role-card-grid">{roles.map((role,index)=><article className="panel role-card" key={role}><span className="role-card-number">0{index+1}</span><h2>{role}</h2><p>{descriptions[index]}</p><span className="member-count">{state.users.filter(user=>user.roles.includes(role)).length} sample members</span></article>)}</div>
      <section className="panel"><div className="panel-header"><div><h2>Permission matrix</h2><p>16 listed permissions · 4 roles · read only</p></div><span className="small-note">✓ Planned access · — Not granted</span></div><div className="table-scroll" tabIndex={0} role="region" aria-label="Permission matrix"><table className="permission-table"><caption className="ui-sr">Sixteen permissions across Admin, Risk, Support and Finance roles</caption><thead><tr><th scope="col">Capability</th>{roles.map(role=><th scope="col" key={role}>{role}</th>)}</tr></thead><tbody>{permissionMatrix.map(permission=><tr key={permission.label}><th scope="row">{permission.label}</th>{roles.map(role=><td key={role}><span className={permission.allowed.includes(role) ? "permission-yes" : "permission-no"} aria-label={permission.allowed.includes(role) ? "Allowed" : "Not granted"}>{permission.allowed.includes(role) ? "✓" : "—"}</span></td>)}</tr>)}</tbody></table></div><div className="panel-footnote">Display only. This matrix does not grant or enforce access. Production permissions must be checked by the backend on every request.</div></section>
    </>
  );
}
