import Link from "next/link";
import { StatusChip } from "@funded-hub/ui";
import type { ApiError } from "@/lib/api/errors";
import { describeApiError } from "@/lib/api/error-view";

/**
 * The shared "what went wrong" panel for API errors (ADM-06), with "Try again" when it can help.
 * A 403 shows "You don't have permission for this page" (ADM-18).
 */
export function ApiErrorPanel({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const view = describeApiError(error);
  return (
    <section className="panel state-panel" data-testid="api-error" data-code={error.code}>
      <div className="inline-alert" role="alert">
        <StatusChip state={view.tone}>{view.chip}</StatusChip>
        <h2>{view.title}</h2>
        <p>{view.text}</p>
        <div className="ops-actions">
          {view.retry && onRetry && (
            <button type="button" className="button button-secondary" onClick={onRetry} data-testid="api-error-retry">
              Try again
            </button>
          )}
          <Link className="quiet-link" href="/">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
