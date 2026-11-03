import Link from "next/link";

/** Shown inside the admin pages when a record doesn't exist (`notFound()`), ADM-06. */
export default function PageNotFound() {
  return (
    <section className="panel state-panel" data-testid="page-not-found">
      <div className="inline-alert" role="status">
        <h2>We couldn&apos;t find this page</h2>
        <p>It may have been moved or removed, or the link is wrong.</p>
        <div className="ops-actions">
          <Link className="button button-secondary" href="/">
            Go to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
