import type { Metadata } from "next";
import { Badge, Button, Card, Input } from "@funded-hub/ui";

export const metadata: Metadata = { title: "Component library" };

export default function DesignSystemPage() {
  return (
    <div className="section container">
      <span className="overline">Frontend foundation / Day 01</span>
      <h1 className="gallery-title">One system.<br />Every screen.</h1>
      <p className="gallery-intro">PDF-inspired tokens, reference typography, and reusable controls for the trader frontend. These are component specimens, not account or payment actions.</p>
      <div className="gallery">
        <Card><h2>Buttons</h2><div className="gallery-row"><Button disabled>Primary (specimen)</Button><Button variant="secondary" disabled>Secondary (specimen)</Button><Button loading>Loading</Button></div></Card>
        <Card><h2>Labels & surfaces</h2><div className="gallery-stack"><div className="gallery-row"><Badge>CRYPTO ONLY</Badge><Badge>DEVELOPMENT PREVIEW</Badge></div><p className="text-sm text-muted">Geist for interface text. <span className="font-mono">JetBrains Mono for numbers.</span></p></div></Card>
        <Card><h2>Form controls</h2><div className="gallery-stack"><Input id="sample-name" label="Name" placeholder="Your name" autoComplete="off" hint="Component specimen. This value is not sent or saved." /><Input id="sample-email" label="Email with error" type="email" defaultValue="not-an-email" autoComplete="off" error="Enter a valid email address." /></div></Card>
        <Card><h2>Reference palette</h2><p className="text-sm text-muted">Navy, blue and white, sampled from the sprint PDFs.</p><div className="swatches"><div><div className="swatch bg-[var(--accent-1)]" /><p className="swatch-name">#13315C</p></div><div><div className="swatch bg-[var(--accent-2)]" /><p className="swatch-name">#3E7CB1</p></div><div><div className="swatch bg-[var(--accent-3)]" /><p className="swatch-name">#0B2545</p></div></div></Card>
      </div>
    </div>
  );
}
