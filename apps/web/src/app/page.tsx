import { Bodoni_Moda, IBM_Plex_Mono, Manrope } from "next/font/google";
import { Landing } from "@/components/landing/landing";
import styles from "@/components/landing/landing.module.css";

const display = Bodoni_Moda({ subsets: ["latin"], weight: "500", variable: "--landing-display", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--landing-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", variable: "--landing-mono", display: "swap" });

export default function HomePage() {
  return <div className={`${styles.page} ${display.variable} ${sans.variable} ${mono.variable}`}><Landing /></div>;
}
