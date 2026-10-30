import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { PreviewProvider } from "@/components/preview-provider";
import { AdminShell } from "@/components/admin-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin workspace | NovaEdge Capital",
  description: "Local admin frontend design preview with fictional data. No authentication or production access.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={GeistSans.variable}><body><PreviewProvider><AdminShell>{children}</AdminShell></PreviewProvider></body></html>;
}
