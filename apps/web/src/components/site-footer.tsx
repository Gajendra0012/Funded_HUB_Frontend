/* eslint-disable @next/next/no-html-link-for-pages -- Plain <a> on purpose: a full page load to the landing
   page, which uses its own stylesheet, so these older styles don't carry over into it. */
import { brand } from "@/config/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand"><a href="/" className="brand"><span className="logo" aria-hidden="true">N↗</span><span>{brand.shortName}<small> HUB</small></span></a><p>Built for the discipline.<br/>Designed for what’s next.</p><span className="footer-label">CRYPTO-ONLY PROP TRADING</span></div>
        <div><h2>Explore</h2><a href="/#challenges">Challenge programs</a><a href="/#how-it-works">How it works</a><a href="/#dashboard-preview">Trader overview</a></div>
        <div><h2>Learn</h2><a href="/#platform">Bybit Demo Trading</a><a href="/#rewards">Reward process</a><a href="/#faq">Common questions</a></div>
        <div><h2>Our approach</h2><p>Simulated capital.<br/>Visible objectives.<br/>Clear risk boundaries.</p></div>
      </div>
      <div className="container footer-bottom"><p><strong>Risk disclosure.</strong> All evaluation and funded accounts use virtual funds. Eligible rewards are paid by the firm under the applicable program terms. Trading involves risk; simulated performance does not guarantee future results. Nothing on this site is investment advice.</p><div><span>© 2026 {brand.name}</span><span>{brand.previewNotice} No purchases or account connections are available.</span></div></div>
    </footer>
  );
}
