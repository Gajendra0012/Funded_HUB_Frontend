import { Skeleton } from "@funded-hub/ui";

/** Shown while an admin page loads (ADM-06). The sidebar and top bar stay in place. */
export default function PageLoading() {
  return (
    <section className="panel state-panel" aria-busy="true" data-testid="page-loading">
      <Skeleton variant="line" label="Loading the page" />
      <div className="state-kpis">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
      <Skeleton variant="table" />
    </section>
  );
}
