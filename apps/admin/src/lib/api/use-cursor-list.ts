import { useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import { cursorListReducer, initialCursorList, type ListStatus } from "./paging";
import type { ApiResult, PageMeta } from "./types";

export type FetchPage<T> = (cursor: string | null, signal: AbortSignal) => Promise<ApiResult<T[], PageMeta>>;

/**
 * A list that loads page by page (ADM-10). `key` identifies the filters: when it changes, the list
 * starts again from the first page. Answers for older filters are dropped.
 *
 *   const list = useCursorList(queryKey(filters), (cursor, signal) =>
 *     api.get("/api/v1/admin/traders", { query: { ...filters, cursor: cursor ?? undefined }, signal }));
 */
export function useCursorList<T extends { id: string }>(key: string, fetchPage: FetchPage<T>) {
  const [state, dispatch] = useReducer(cursorListReducer<T>, undefined, initialCursorList<T>);
  const [attempt, setAttempt] = useState(0);
  // A thrown error is a bug, not an API error: re-thrown while rendering so the page's error screen shows it.
  const [crash, setCrash] = useState<{ error: unknown } | null>(null);
  const moreRequest = useRef<AbortController | null>(null);
  const currentKey = `${attempt}:${key}`;

  const loadFirstPage = useEffectEvent((forKey: string, signal: AbortSignal) => {
    fetchPage(null, signal).then(
      (result) => {
        if (!signal.aborted) dispatch({ type: "first-page", forKey, result });
      },
      (error: unknown) => setCrash({ error }),
    );
  });

  useEffect(() => {
    moreRequest.current?.abort();
    const controller = new AbortController();
    loadFirstPage(currentKey, controller.signal);
    return () => controller.abort();
  }, [currentKey]);

  if (crash) throw crash.error;

  const current = state.forKey === currentKey;

  function loadMore() {
    const cursor = state.nextCursor;
    if (!current || cursor === null || (state.status !== "ready" && state.status !== "error-more")) return;
    const seq = state.moreSeq + 1;
    const controller = new AbortController();
    moreRequest.current = controller;
    dispatch({ type: "more-start", seq });
    fetchPage(cursor, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) dispatch({ type: "more-page", forKey: currentKey, seq, result });
      },
      (error: unknown) => setCrash({ error }),
    );
  }

  const status: ListStatus = current ? state.status : "loading";
  return {
    items: current ? state.items : [],
    status,
    error: current ? state.error : null,
    hasMore: current && state.nextCursor !== null,
    loadMore,
    /** Tries the failed request again. */
    retry: () => (status === "error-more" ? loadMore() : setAttempt((n) => n + 1)),
    /** Starts again from the first page (for example after a change). */
    reload: () => setAttempt((n) => n + 1),
  };
}

/** `value`, but only after it stopped changing for `delayMs` (search boxes send one request, not one per key). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
