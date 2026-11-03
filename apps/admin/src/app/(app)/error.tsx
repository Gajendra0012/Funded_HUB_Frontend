"use client";

import Link from "next/link";
import { StatusChip } from "@funded-hub/ui";

/**
 * Shown when an admin page crashes (ADM-06), inside the normal sidebar and top bar.
 * The error's own text is never shown: it can contain internal details. `digest` matches the server log.
 * `retry` loads the page again (Next.js 16.3: retry re-fetches; reset would only re-render).
 */
export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className="panel state-panel" data-testid="page-error">
      <div className="inline-alert" role="alert">
        <StatusChip state="loss">Page error</StatusChip>
        <h2>Something went wrong on this page</h2>
        <p>
          Try again. If it keeps happening, tell the tech team
          {error.digest ? (
            <>
              {" "}
              and quote this reference: <code>{error.digest}</code>
            </>
          ) : null}
          .
        </p>
        <div className="ops-actions">
          <button type="button" className="button button-secondary" onClick={() => retry()} data-testid="page-error-retry">
            Try again
          </button>
          <Link className="quiet-link" href="/">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
