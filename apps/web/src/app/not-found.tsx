import Link from "next/link";
import { buttonClasses } from "@funded-hub/ui";

export default function NotFound() {
  return <div className="section container"><span className="eyebrow">404</span><h1>Page not found.</h1><p className="hero-copy">This page isn’t available. Return to the preview homepage.</p><Link className={buttonClasses()} href="/">Back to home</Link></div>;
}
