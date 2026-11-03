import { describe, expect, it } from "vitest";
import { apiError } from "../src/lib/api/errors";
import { cleanQuery, cursorListReducer, initialCursorList, queryKey, SEARCH_MAX_LENGTH, type CursorListState } from "../src/lib/api/paging";
import type { ApiResult, PageMeta } from "../src/lib/api/types";

type Row = { id: string; name: string };
const row = (id: string): Row => ({ id, name: `Row ${id}` });
const page = (ids: string[], next: string | null): ApiResult<Row[], PageMeta> => ({ ok: true, status: 200, data: ids.map(row), meta: { next_cursor: next } });
const failure = (code: "NETWORK_ERROR" | "FORBIDDEN"): ApiResult<Row[], PageMeta> => ({ ok: false, error: apiError(code, code === "FORBIDDEN" ? 403 : 0) });
const reduce = cursorListReducer<Row>;

function loaded(ids: string[], next: string | null, forKey = "k1"): CursorListState<Row> {
  return reduce(initialCursorList<Row>(), { type: "first-page", forKey, result: page(ids, next) });
}

describe("cursor paging (ADM-10)", () => {
  it("shows the first page and remembers where the next one starts", () => {
    expect(loaded(["a", "b"], "c1")).toMatchObject({ forKey: "k1", items: [row("a"), row("b")], nextCursor: "c1", status: "ready", error: null });
  });

  it("adds the next page below, and drops rows that show up twice (cursors are offsets)", () => {
    const first = loaded(["a", "b"], "c1");
    const loading = reduce(first, { type: "more-start", seq: first.moreSeq + 1 });
    expect(loading.status).toBe("loading-more");
    const second = reduce(loading, { type: "more-page", forKey: "k1", seq: loading.moreSeq, result: page(["b", "c"], null) });
    expect(second.items.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(second).toMatchObject({ nextCursor: null, status: "ready" });
  });

  it("ignores an answer for older filters or an older request", () => {
    const first = loaded(["a"], "c1");
    const loading = reduce(first, { type: "more-start", seq: first.moreSeq + 1 });
    expect(reduce(loading, { type: "more-page", forKey: "k0", seq: loading.moreSeq, result: page(["x"], null) })).toBe(loading);
    expect(reduce(loading, { type: "more-page", forKey: "k1", seq: loading.moreSeq - 1, result: page(["x"], null) })).toBe(loading);
  });

  it("a new first page cancels a 'load more' still on its way", () => {
    const first = loaded(["a"], "c1");
    const loading = reduce(first, { type: "more-start", seq: first.moreSeq + 1 });
    const refiltered = reduce(loading, { type: "first-page", forKey: "k2", result: page(["z"], null) });
    expect(reduce(refiltered, { type: "more-page", forKey: "k1", seq: loading.moreSeq, result: page(["late"], null) })).toBe(refiltered);
  });

  it("keeps the rows when only 'load more' fails, and can try it again", () => {
    const first = loaded(["a"], "c1");
    const loading = reduce(first, { type: "more-start", seq: 1 + first.moreSeq });
    const failed = reduce(loading, { type: "more-page", forKey: "k1", seq: loading.moreSeq, result: failure("NETWORK_ERROR") });
    expect(failed).toMatchObject({ items: [row("a")], nextCursor: "c1", status: "error-more", error: { code: "NETWORK_ERROR" } });
    expect(reduce(failed, { type: "more-start", seq: failed.moreSeq + 1 }).status).toBe("loading-more");
  });

  it("shows the error when the first page fails (403 included)", () => {
    const state = reduce(initialCursorList<Row>(), { type: "first-page", forKey: "k1", result: failure("FORBIDDEN") });
    expect(state).toMatchObject({ items: [], status: "error", error: { code: "FORBIDDEN" } });
  });

  it("doesn't start 'load more' on the last page or while loading", () => {
    const last = loaded(["a"], null);
    expect(reduce(last, { type: "more-start", seq: 9 })).toBe(last);
    const first = loaded(["a"], "c1");
    const loading = reduce(first, { type: "more-start", seq: first.moreSeq + 1 });
    expect(reduce(loading, { type: "more-start", seq: loading.moreSeq + 1 })).toBe(loading);
  });
});

describe("filters sent to the server (ADM-10)", () => {
  it("trims text and drops empty values (the API refuses empty strings)", () => {
    expect(cleanQuery({ q: "  jane ", status: "", limit: 20, cursor: undefined, actor_id: null })).toEqual({ q: "jane", limit: 20 });
    expect(cleanQuery({ q: "   " })).toEqual({});
  });

  it(`caps the search at the contract's ${SEARCH_MAX_LENGTH} characters`, () => {
    expect(cleanQuery({ q: "x".repeat(150) }).q).toHaveLength(SEARCH_MAX_LENGTH);
  });

  it("gives the same key for the same filters in any order", () => {
    expect(queryKey({ q: "jane", status: "ACTIVE" })).toBe(queryKey({ status: "ACTIVE", q: "jane" }));
    expect(queryKey({ q: "jane" })).not.toBe(queryKey({ q: "john" }));
  });
});
