"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button, Input } from "@funded-hub/ui";
import { usePreview } from "@/components/preview-provider";
import { Status } from "@/components/status";
import { currentPreviewUser, formatTimestamp, roles, type AdminUser, type Role, type UserInput } from "@/lib/preview";

const emptyDraft: UserInput = { name: "", email: "", roles: [] };

export default function UsersPage() {
  const { state, execute } = usePreview();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState<UserInput>(emptyDraft);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const editor = useRef<HTMLDialogElement>(null);
  const statusDialog = useRef<HTMLDialogElement>(null);
  const filtered = state.users.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(search.trim().toLowerCase()) && (!roleFilter || user.roles.includes(roleFilter as Role)));

  function openEditor(user: AdminUser | null) {
    setEditing(user);
    setDraft(user ? { name: user.name, email: user.email, roles: [...user.roles] } : emptyDraft);
    setError("");
    editor.current?.showModal();
  }

  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      execute(editing ? { type: "update-user", id: editing.id, user: draft } : { type: "create-user", user: draft });
      setMessage(editing ? `${draft.name.trim()} updated in the preview. The change is in the audit log.` : `${draft.name.trim()} added as a sample invitation. No email was sent.`);
      editor.current?.close();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The preview user could not be saved."); }
  }

  function changeStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!statusTarget) return;
    try {
      execute({ type: "toggle-user", id: statusTarget.id });
      setMessage(`${statusTarget.name} ${statusTarget.status === "Active" ? "disabled" : "enabled"} in the preview. No real access changed.`);
      statusDialog.current?.close();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Status could not be changed."); }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">PEOPLE & ACCESS</span><h1>Admin users</h1><p>The team behind the platform. Give each person a clear role.</p></div><Button onClick={() => openEditor(null)}>＋ Add sample user</Button></div>
      {message && <p className="feedback feedback-success" role="status">{message}</p>}
      <section className="panel"><div className="panel-header"><div><h2>Team directory <span className="count-tag">{state.users.length}</span></h2><p>Fictional staff accounts · Changes last until reload</p></div><span className="small-note">Current preview account is protected</span></div>
        <div className="filter-bar"><div className="search-field"><label className="sr-only" htmlFor="user-search">Search admin users</label><span aria-hidden="true">⌕</span><input className="field" id="user-search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search names or email addresses…"/></div><label className="select-filter">Role<select value={roleFilter} onChange={event=>setRoleFilter(event.target.value)}><option value="">All roles</option>{roles.map(role=><option key={role}>{role}</option>)}</select></label><span className="results-count">{filtered.length} results</span></div>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Admin users table"><table className="users-table"><thead><tr><th scope="col">Team member</th><th scope="col">Roles</th><th scope="col">Status</th><th scope="col">Sample 2FA</th><th scope="col">Last sign-in · UTC</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map(user=><tr key={user.id}><th scope="row"><div className="person-cell"><span className="avatar avatar-small">{user.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><span>{user.name}{user.id === currentPreviewUser && <span className="you-label">YOU</span>}<small>{user.email}</small></span></div></th><td><div className="role-pills">{user.roles.map(role=><span className="role-pill" key={role}>{role}</span>)}</div></td><td><Status value={user.status}/></td><td><Status value={user.twoFactor}/></td><td className="muted-cell">{formatTimestamp(user.lastLogin)}</td><td><div className="row-actions"><button aria-label={`Edit ${user.name}`} onClick={()=>openEditor(user)}>Edit</button><button aria-label={`${user.status === "Disabled" ? "Enable" : "Disable"} ${user.name}`} disabled={user.id===currentPreviewUser || user.status==="Invited"} onClick={()=>{setStatusTarget(user);setError("");statusDialog.current?.showModal();}}>{user.status === "Disabled" ? "Enable" : "Disable"}</button></div></td></tr>)}</tbody></table></div>
        {!filtered.length && <div className="empty-state"><strong>No matching team members</strong><p>Try a different name, email or role.</p><Button variant="secondary" onClick={()=>{setSearch("");setRoleFilter("");}}>Clear filters</Button></div>}
        <div className="panel-footnote">Sample 2FA statuses are illustrative. Real enrollment, invitation emails and access revocation require the admin API.</div>
      </section>
      <dialog ref={editor} className="admin-dialog" aria-labelledby="editor-title"><button className="dialog-close" aria-label="Close user editor" onClick={()=>editor.current?.close()}>×</button><span className="eyebrow">TEAM DIRECTORY / PREVIEW</span><h2 id="editor-title">{editing ? "Edit team member" : "Add a team member"}</h2><p>This changes sample data only. No account is provisioned and no invitation email is sent.</p><form onSubmit={saveUser} className="editor-form"><Input id="staff-name" label="Full name" required maxLength={80} value={draft.name} autoComplete="off" onChange={event=>setDraft({...draft,name:event.target.value})}/><Input id="staff-email" label="Email address" required type="email" maxLength={254} value={draft.email} autoComplete="off" onChange={event=>setDraft({...draft,email:event.target.value})}/><fieldset className="role-checkboxes"><legend>Assign roles <span>Select at least one</span></legend>{roles.map(role=><label key={role}><input type="checkbox" value={role} checked={draft.roles.includes(role)} onChange={event=>setDraft({...draft,roles:event.target.checked ? [...draft.roles,role] : draft.roles.filter(item=>item!==role)})}/>{role}</label>)}</fieldset>{error && <p className="feedback feedback-error" role="alert">{error}</p>}<div className="dialog-actions"><Button variant="secondary" onClick={()=>editor.current?.close()}>Cancel</Button><Button type="submit">{editing ? "Save preview changes" : "Add sample invitation"}</Button></div></form></dialog>
      <dialog ref={statusDialog} className="admin-dialog" aria-labelledby="status-title"><h2 id="status-title">{statusTarget?.status === "Active" ? "Disable" : "Enable"} this sample user?</h2><p>{statusTarget?.name} will be {statusTarget?.status === "Active" ? "disabled" : "enabled"} in the local preview. This does not change real access.</p>{error && <p className="feedback feedback-error" role="alert">{error}</p>}<form onSubmit={changeStatus} className="dialog-actions"><Button variant="secondary" onClick={()=>statusDialog.current?.close()}>Cancel</Button><Button type="submit">Confirm preview change</Button></form></dialog>
    </>
  );
}
