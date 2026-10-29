"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@funded-hub/ui";
import { brand } from "@/config/brand";

const links = [["Challenges", "/#challenges"], ["How it works", "/#how-it-works"], ["Rewards", "/#rewards"], ["FAQ", "/#faq"]];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${brand.name} home`} onClick={() => setMenuOpen(false)}><span className="logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M6 18V6l12 12V6M12 6h6v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square"/></svg></span><span>{brand.shortName}<small> CAPITAL</small></span></Link>
        <nav className="site-nav" aria-label="Main navigation">{links.map(([name, href]) => <Link key={name} href={href}>{name}</Link>)}</nav>
        <div className="header-actions"><Link className="trader-link" href="/#dashboard-preview">Trader preview <span aria-hidden="true">↗</span></Link><Link className={buttonClasses()} href="/#challenges">Explore challenges <span aria-hidden="true">↗</span></Link></div>
        <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }}><span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
      </div>
      {menuOpen && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation" onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }}>{links.map(([name, href]) => <Link key={name} href={href} onClick={() => setMenuOpen(false)}>{name}<span aria-hidden="true">↗</span></Link>)}<Link href="/#dashboard-preview" onClick={() => setMenuOpen(false)}>Trader preview <span aria-hidden="true">↗</span></Link></nav>}
    </header>
  );
}
