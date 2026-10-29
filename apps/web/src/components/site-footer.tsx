import Link from "next/link";
import { brand } from "@/config/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand"><Link href="/" className="brand"><span className="logo" aria-hidden="true">N↗</span><span>{brand.shortName}<small> CAPITAL</small></span></Link><p>Built for the discipline.<br/>Designed for what’s next.</p><span className="footer-label">CRYPTO-ONLY PROP TRADING</span></div>
        <div><h2>Explore</h2><Link href="/#challenges">Challenge programs</Link><Link href="/#how-it-works">How it works</Link><Link href="/#dashboard-preview">Trader overview</Link></div>
        <div><h2>Learn</h2><Link href="/#platform">Bybit Demo Trading</Link><Link href="/#rewards">Reward process</Link><Link href="/#faq">Common questions</Link></div>
        <div><h2>Our approach</h2><p>Simulated capital.<br/>Visible objectives.<br/>Clear risk boundaries.</p></div>
      </div>
      <div className="container footer-bottom"><p><strong>Risk disclosure.</strong> All evaluation and funded accounts use virtual funds. Eligible rewards are paid by the firm under the applicable program terms. Trading involves risk; simulated performance does not guarantee future results. Nothing on this site is investment advice.</p><div><span>© 2026 {brand.name}</span><span>{brand.previewNotice} No purchases or account connections are available.</span></div></div>
    </footer>
  );
}
