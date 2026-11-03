import type { ApiError } from "@/lib/api/errors";
import type { ListStatus } from "@/lib/api/paging";

/**
 * The bottom of a cursor-paged list (ADM-10): "Load more" while there's a next page, then
 * "End of list". There are no totals: the API doesn't give them (decision D5).
 */
export function LoadMore({
  status,
  hasMore,
  count,
  error,
  onLoadMore,
}: {
  status: ListStatus;
  hasMore: boolean;
  count: number;
  error: ApiError | null;
  onLoadMore: () => void;
}) {
  if (status === "error-more" && error) {
    return (
      <div className="load-more" role="alert" data-testid="load-more-error">
        <span>{error.message}</span>
        <button type="button" className="button button-secondary" onClick={onLoadMore} data-testid="load-more-retry">
          Try again
        </button>
      </div>
    );
  }
  if (hasMore) {
    return (
      <div className="load-more">
        <button type="button" className="button button-secondary" onClick={onLoadMore} disabled={status === "loading-more"} data-testid="load-more">
          {status === "loading-more" ? "Loading…" : "Load more"}
        </button>
      </div>
    );
  }
  if (status === "ready" && count > 0) {
    return (
      <p className="load-more small-note" data-testid="list-end">
        End of list · {count} shown
      </p>
    );
  }
  return null;
}
