/**
 * Lists that load page by page with the API's cursor (ADM-10).
 *
 * The API returns `meta.next_cursor` (null on the last page) and no totals (decision D5), so lists
 * show "Load more", not page numbers. Cursors are offsets: if rows are added between two requests,
 * a row can appear twice, so pages are merged by ID.
 */
import type { ApiError } from "./errors";
import type { ApiResult, PageMeta } from "./types";

/** The contract's limit on search text (`q`). */
export const SEARCH_MAX_LENGTH = 100;

export type ListStatus = "loading" | "ready" | "loading-more" | "error" | "error-more";

export type CursorListState<T> = {
  /** The filters (and attempt) these items belong to. A different key means the list is loading again. */
  forKey: string | null;
  items: T[];
  nextCursor: string | null;
  status: ListStatus;
  error: ApiError | null;
  /** Numbers each "load more", so an older answer can never overwrite a newer one. */
  moreSeq: number;
};

export type CursorListAction<T> =
  | { type: "first-page"; forKey: string; result: ApiResult<T[], PageMeta> }
  | { type: "more-start"; seq: number }
  | { type: "more-page"; forKey: string; seq: number; result: ApiResult<T[], PageMeta> };

export function initialCursorList<T>(): CursorListState<T> {
  return { forKey: null, items: [], nextCursor: null, status: "loading", error: null, moreSeq: 0 };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}

export function cursorListReducer<T extends { id: string }>(state: CursorListState<T>, action: CursorListAction<T>): CursorListState<T> {
  switch (action.type) {
    case "first-page": {
      // A new first page also cancels any "load more" still on its way for the old list.
      const moreSeq = state.moreSeq + 1;
      if (!action.result.ok) return { forKey: action.forKey, items: [], nextCursor: null, status: "error", error: action.result.error, moreSeq };
      return { forKey: action.forKey, items: uniqueById(action.result.data), nextCursor: action.result.meta.next_cursor, status: "ready", error: null, moreSeq };
    }
    case "more-start":
      if ((state.status !== "ready" && state.status !== "error-more") || state.nextCursor === null) return state;
      return { ...state, status: "loading-more", error: null, moreSeq: action.seq };
    case "more-page":
      if (action.forKey !== state.forKey || action.seq !== state.moreSeq) return state;
      if (!action.result.ok) return { ...state, status: "error-more", error: action.result.error };
      return {
        ...state,
        items: uniqueById([...state.items, ...action.result.data]),
        nextCursor: action.result.meta.next_cursor,
        status: "ready",
        error: null,
      };
  }
}

type QueryValue = string | number | null | undefined;

/** Filters ready to send: text trimmed, empty values dropped (the API refuses empty strings), search capped at 100 characters. */
export function cleanQuery<Q extends Record<string, QueryValue>>(query: Q): { [K in keyof Q]?: Exclude<Q[K], null | ""> } {
  const clean: Record<string, string | number> = {};
  for (const [key, raw] of Object.entries(query)) {
    const value = typeof raw === "string" ? raw.trim() : raw;
    if (value === undefined || value === null || value === "") continue;
    clean[key] = key === "q" && typeof value === "string" ? value.slice(0, SEARCH_MAX_LENGTH) : value;
  }
  return clean as { [K in keyof Q]?: Exclude<Q[K], null | ""> };
}

/** A stable key for a set of filters: the same filters in any order give the same key. */
export function queryKey(query: Record<string, QueryValue>): string {
  return JSON.stringify(Object.entries(query).sort(([a], [b]) => a.localeCompare(b)));
}
