import { Skeleton } from "@funded-hub/ui";

/** Shown while a live list loads its first page. */
export function LoadingPanel({ label, inline = false }: { label: string; inline?: boolean }) {
  return (
    <section className={inline ? "state-panel" : "panel state-panel"} aria-busy="true" data-testid="loading-panel">
      <Skeleton variant="table" label={label} />
    </section>
  );
}
