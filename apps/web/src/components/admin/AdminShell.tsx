"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Blocks, LayoutDashboard, ShieldAlert, Users, Wallet } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { DemoPill } from "@/components/ui/Misc";
import { brand } from "@/config/brand";

export const ADMIN_NAV_GROUPS = [
  { label: "Overview", icon: LayoutDashboard, items: [["Dashboard", "overview"]] },
  { label: "Trading", icon: Activity, items: [["Risk monitor", "risk"], ["Violations", "violations"], ["Pass reviews", "pass-reviews"], ["Abuse review", "abuse-review"]] },
  { label: "People", icon: Users, items: [["Traders", "traders"], ["KYC queue", "kyc"], ["Admin users", "staff"], ["Roles", "roles"]] },
  { label: "Money", icon: Wallet, items: [["Orders", "orders"], ["Refunds", "refunds"], ["Payouts", "payouts"], ["Liability", "liability"], ["Affiliates", "affiliates"], ["Discount codes", "discount-codes"]] },
  { label: "Setup", icon: Blocks, items: [["Programs", "programs"], ["Rule sets", "rule-sets"], ["Instruments", "instruments"], ["Settings", "settings"]] },
  { label: "System", icon: ShieldAlert, items: [["Audit log", "audit"], ["Connection health", "connection-health"], ["Reports", "reports"]] },
] as const;

export function AdminShell({ children, live = false, actions }: { children: ReactNode; live?: boolean; actions?: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-elevated/85 backdrop-blur-xl lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <LogoMark className="size-8" />
          <span className="text-[15px] font-semibold">{brand.shortName}</span>
          <span className="rounded-md border border-warning/40 bg-warning/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">Admin</span>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 space-y-3 overflow-y-auto px-3 pb-4">
          {ADMIN_NAV_GROUPS.map(({ label, icon: Icon, items }) => (
            <section key={label}>
              <h2 className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</h2>
              {items.map(([name, id]) => (
                <a key={id} href={`#${id}`} className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-white/5 hover:text-fg">
                  <Icon aria-hidden className="size-4" />{name}
                </a>
              ))}
            </section>
          ))}
        </nav>
        <Link href="/" className="flex items-center gap-3 border-t border-line p-4 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Back to website
        </Link>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line bg-[#05070d]/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold">Back office</h1>
            {!live && <DemoPill />}
            {actions && <div className="ml-auto">{actions}</div>}
          </div>
          <nav aria-label="Mobile admin navigation" className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
            {ADMIN_NAV_GROUPS.flatMap(group => group.items.map(([name, id]) => (
              <a key={id} href={`#${id}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-muted">{name}</a>
            )))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
