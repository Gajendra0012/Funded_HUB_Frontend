"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@funded-hub/ui";
import { usePreview } from "./preview-provider";

const navigation = [
  { href: "/", label: "Overview", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/users", label: "Admin users", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8" },
  { href: "/roles", label: "Roles & permissions", icon: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11ZM9 12l2 2 4-4" },
  { href: "/audit", label: "Audit log", icon: "M8 3H5v18h14V3h-3M9 2h6v4H9zM8 11h8M8 15h8" },
  { href: "/settings", label: "Platform settings", icon: "M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const { reset } = usePreview();
  const current = navigation.find(item => item.href === pathname)?.label ?? "Admin workspace";

  return (
    <div className="admin-layout">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <Link className="admin-brand" href="/" onClick={() => setMobileOpen(false)}><span className="brand-mark" aria-hidden="true">N↗</span><span>NovaEdge<small>CAPITAL / ADMIN</small></span></Link>
        <div className="workspace-label"><span className="workspace-dot"/>Demo workspace<span>LOCAL</span></div>
        <span className="nav-group-label">WORKSPACE</span>
        <nav aria-label="Admin navigation">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMobileOpen(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon}/></svg>{item.label}{pathname === item.href && <span className="active-nav-dot"/>}</Link>)}</nav>
        <div className="sidebar-bottom"><div className="sidebar-note"><span aria-hidden="true">◇</span><strong>A foundation for oversight.</strong><p>Users, access and operational context. One workspace.</p></div><button className="reset-preview" onClick={() => resetDialog.current?.showModal()}>↺ Reset sample data</button><div className="sidebar-user"><span className="avatar">AM</span><div><strong>Alex Morgan</strong><span>Preview administrator</span></div><span className="user-preview-dot"/></div></div>
      </aside>
      <div className="admin-main">
        <header className="topbar"><button className="mobile-toggle" aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? "×" : "☰"}</button><div className="breadcrumb">Workspace <span>/</span> <strong>{current}</strong></div><div className="topbar-right"><span className="environment-tag"><span/>DESIGN PREVIEW</span><span className="topbar-divider"/><span className="topbar-date">29 Oct 2026 <small>· sample session</small></span></div></header>
        <div className="preview-banner"><span className="banner-icon" aria-hidden="true">i</span><p><strong>Local frontend preview.</strong> Fictional data, kept in memory. No real login, permissions or account changes. Reload to reset.</p></div>
        <main id="main-content" tabIndex={-1} className="content-wrap">{children}</main>
        <footer className="admin-footer"><span>NovaEdge Capital · Admin design preview</span><span>Authentication and APIs are not connected</span></footer>
      </div>
      <dialog ref={resetDialog} className="admin-dialog" aria-labelledby="reset-title"><h2 id="reset-title">Reset the workspace?</h2><p>This clears only the in-memory sample edits and restores the original fictional users, settings and events.</p><form method="dialog" className="dialog-actions"><Button variant="secondary" type="submit">Keep changes</Button><Button type="submit" onClick={() => reset()}>Reset sample data</Button></form></dialog>
    </div>
  );
}
