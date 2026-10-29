import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { LandingShell } from "@/components/landing/landing-shell";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { brand } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${brand.name} | Crypto trading`, template: `%s | ${brand.name}` },
  description: "A development preview of a crypto-only prop trading platform using simulated Bybit accounts.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <LandingShell><SiteHeader /></LandingShell>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <LandingShell><SiteFooter /></LandingShell>
      </body>
    </html>
  );
}
