import Link from "next/link";
import { buttonClasses } from "@funded-hub/ui";

export default function NotFound() {
  return <div className="empty-state not-found"><span className="eyebrow">404 / ADMIN WORKSPACE</span><h1>This page isn’t here.</h1><p>Return to the workspace overview.</p><Link href="/" className={buttonClasses()}>Back to overview</Link></div>;
}
