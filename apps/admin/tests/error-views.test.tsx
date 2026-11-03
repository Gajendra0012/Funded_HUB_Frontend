import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PageError from "../src/app/(app)/error";
import { ApiErrorPanel } from "../src/components/api-error-panel";
import { LoadMore } from "../src/components/load-more";
import { apiError } from "../src/lib/api/errors";
import { describeApiError } from "../src/lib/api/error-view";

describe("the API error panel (ADM-06, ADM-18)", () => {
  it("a 403 says 'You don't have permission for this page', with no pointless retry", () => {
    const view = describeApiError(apiError("FORBIDDEN", 403));
    expect(view).toMatchObject({ title: "You don't have permission for this page", retry: false });
    const html = renderToStaticMarkup(<ApiErrorPanel error={apiError("FORBIDDEN", 403)} onRetry={() => {}} />);
    expect(html).toContain("You don&#x27;t have permission for this page");
    expect(html).not.toContain("api-error-retry");
  });

  it("offers 'Try again' when trying again can help", () => {
    for (const code of ["NETWORK_ERROR", "TIMEOUT", "SERVICE_UNAVAILABLE", "INTERNAL_ERROR", "TOO_MANY_REQUESTS"] as const) {
      expect(describeApiError(apiError(code, 0)).retry, code).toBe(true);
    }
    const html = renderToStaticMarkup(<ApiErrorPanel error={apiError("NETWORK_ERROR", 0)} onRetry={() => {}} />);
    expect(html).toContain("Can&#x27;t reach the admin service");
    expect(html).toContain('data-testid="api-error-retry"');
  });

  it("doesn't offer it for answers that won't change", () => {
    for (const code of ["NOT_FOUND", "SESSION_ENDED", "VALIDATION_FAILED", "CONFLICT"] as const) {
      expect(describeApiError(apiError(code, 400)).retry, code).toBe(false);
    }
  });
});

describe("the crash screen (ADM-06)", () => {
  it("shows the reference and 'Try again', never the error's own text", () => {
    const error = Object.assign(new Error("secret internal detail"), { digest: "4152007" });
    const html = renderToStaticMarkup(<PageError error={error} retry={() => {}} />);
    expect(html).toContain("Something went wrong on this page");
    expect(html).toContain("4152007");
    expect(html).toContain('data-testid="page-error-retry"');
    expect(html).not.toContain("secret internal detail");
  });
});

describe("'Load more' (ADM-10)", () => {
  const render = (props: Partial<Parameters<typeof LoadMore>[0]>) =>
    renderToStaticMarkup(<LoadMore status="ready" hasMore={false} count={0} error={null} onLoadMore={() => {}} {...props} />);

  it("offers the next page, and is busy while it loads", () => {
    expect(render({ hasMore: true })).toContain(">Load more<");
    expect(render({ hasMore: true, status: "loading-more" })).toMatch(/disabled="".*Loading…/);
  });

  it("says the list is complete, without totals (the API has none)", () => {
    expect(render({ count: 3 })).toContain("End of list · 3 shown");
    expect(render({ count: 0 })).toBe("");
  });

  it("shows the error and 'Try again' when the next page fails", () => {
    const html = render({ hasMore: true, status: "error-more", error: apiError("TIMEOUT", 0) });
    expect(html).toContain("took too long");
    expect(html).toContain('data-testid="load-more-retry"');
  });
});
