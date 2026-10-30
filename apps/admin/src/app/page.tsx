"use client";

import Link from "next/link";
import { buttonClasses } from "@funded-hub/ui";
import { usePreview } from "@/components/preview-provider";
import { Status } from "@/components/status";
import { formatTimestamp, roles } from "@/lib/preview";

export default function OverviewPage() {
  const { state } = usePreview();
  const active = state.users.filter(user => user.status === "Active");
  const pending = state.users.filter(user => user.status === "Invited");
  const metrics = [
    { label: "Team members", value: state.users.length, detail: `${active.length} active in the sample workspace`, icon: "↗" },
    { label: "Access roles", value: roles.length, detail: "Admin, Risk, Support, Finance", icon: "◇" },
    { label: "Pending invitations", value: pending.length, detail: "Sample accounts awaiting setup", icon: "↗" },
    { label: "Audit events", value: state.events.length, detail: "Read-only preview activity stream", icon: "≡" },
  ];
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">YOUR OPERATIONS, IN PERSPECTIVE</span><h1>Workspace overview</h1><p>A clear view of your team, access and recent activity.</p></div><Link href="/users" className={buttonClasses()}>Manage team <span aria-hidden="true">↗</span></Link></div>
      <div className="metric-grid">{metrics.map(metric => <article className="metric-card" key={metric.label}><div><span>{metric.label}</span><i aria-hidden="true">{metric.icon}</i></div><strong>{metric.value.toString().padStart(2,"0")}</strong><p>{metric.detail}</p></article>)}</div>
      <div className="overview-grid"><section className="panel team-panel"><div className="panel-header"><div><h2>Your team at a glance</h2><p>People behind the platform</p></div><Link href="/users" className="quiet-link">View team ↗</Link></div><div className="role-distribution">{roles.map((role,index) => <div key={role}><span className={`role-bar role-bar-${index}`} style={{width:`${state.users.filter(user=>user.roles.includes(role)).length / state.users.length * 100}%`}}/><span>{role}</span><strong>{state.users.filter(user=>user.roles.includes(role)).length}</strong></div>)}</div><div className="table-scroll"><table><caption className="sr-only">Sample team members</caption><thead><tr><th scope="col">Team member</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody>{state.users.slice(0,4).map(user=><tr key={user.id}><th scope="row"><div className="person-cell"><span className="avatar avatar-small">{user.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><span>{user.name}<small>{user.email}</small></span></div></th><td><span className="role-pill">{user.roles.join(" / ")}</span></td><td><Status value={user.status}/></td></tr>)}</tbody></table></div></section>
      <section className="security-panel"><span className="security-icon" aria-hidden="true">◇</span><span className="eyebrow">SECURE BY DESIGN · CONNECTION PENDING</span><h2>Access starts<br/>with trust.</h2><p>The production workspace will require verified admin sessions, mandatory 2FA and server-enforced permissions.</p><div className="security-row"><span>Admin authentication</span><strong>Not connected</strong></div><div className="security-row"><span>API authorization</span><strong>Not connected</strong></div><Link href="/roles">Review the permission matrix <span aria-hidden="true">↗</span></Link></section></div>
      <div className="overview-lower"><section className="panel"><div className="panel-header"><div><h2>Recent activity</h2><p>Sample events and your preview edits · UTC</p></div><Link href="/audit" className="quiet-link">View audit log ↗</Link></div><ol className="activity-list">{state.events.slice(0,4).map(event=><li key={event.id}><span className="activity-icon" aria-hidden="true">↗</span><div><strong>{event.action}</strong><p>{event.actor} <span>· {event.entity}</span></p></div><time dateTime={event.at}>{formatTimestamp(event.at)}</time></li>)}</ol></section><section className="panel next-steps"><span className="eyebrow">WORKSPACE ESSENTIALS</span><h2>Keep everything<br/>in order.</h2><Link href="/users"><span>01</span><div><strong>Manage your team</strong><small>Add sample users and review their roles.</small></div><span aria-hidden="true">↗</span></Link><Link href="/settings"><span>02</span><div><strong>Review platform settings</strong><small>Preview branding and eligibility controls.</small></div><span aria-hidden="true">↗</span></Link></section></div>
    </>
  );
}
