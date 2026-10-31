import { Instrument_Serif } from "next/font/google";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
const serif=Instrument_Serif({subsets:["latin"],weight:"400",style:"italic",display:"swap",variable:"--font-landing-display"});
export const metadata:Metadata={title:"Admin workspace | Funded HUB",description:"Sample admin UI",robots:{index:false,follow:false}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="en" className={GeistSans.variable+" "+GeistMono.variable+" "+serif.variable}><body className="admin-theme">{children}</body></html>;}
