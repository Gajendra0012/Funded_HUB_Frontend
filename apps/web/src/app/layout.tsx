import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { brand } from "@/config/brand";

/*
 * Root layout: only the <html> and <body> shared by every page.
 * Each group of pages brings its own styles:
 *   - app/(main)/  → the whole product (landing, challenges, auth, checkout, dashboard, admin), styled by theme.css
 *   - app/(site)/  → the design-system page, styled by the older globals.css
 * Keeping them apart means the dark theme and the older light styles never clash.
 */

export const metadata: Metadata = {
  title: { default: `${brand.name} — Trade up to $200,000 of our capital`, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: a small script in (main)/layout.tsx sets the saved colour palette on <html> before React loads.
    <html lang="en" className={GeistSans.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
