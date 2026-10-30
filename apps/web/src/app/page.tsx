import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { LandingExperience } from "@/components/landing/landing-experience";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-landing-sans", display: "block" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-landing-display", display: "block" });

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#040c19" };

export const metadata: Metadata = {
  title: { absolute: "Funded HUB — Your edge. Amplified." },
  description: "Choose a crypto trading challenge, practice on Bybit Demo, and keep your progress and risk limits in view. A Funded HUB design preview using simulated accounts.",
};

export default function HomePage() {
  return <LandingExperience className={[sans.variable, display.variable].join(" ")} />;
}
