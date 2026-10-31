import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { LandingExperience } from "@/components/landing/landing-experience";

const sans = Geist({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-landing-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-landing-mono", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-landing-display", display: "swap" });

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#040c19" };

export const metadata: Metadata = {
  title: { absolute: "Funded HUB — Your edge. Amplified." },
  description: "Choose a crypto trading challenge, practice on Bybit Demo, and keep your progress and risk limits in view. Simulated capital on Bybit Demo with reviewed profit-share rewards.",
};

export default function HomePage() {
  return <LandingExperience className={[sans.variable, mono.variable, display.variable].join(" ")} />;
}
