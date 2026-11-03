/**
 * Types for calling the backend admin API (ADM-08), read from the generated contract types.
 *
 * schema.d.ts is generated from contract/openapi.json (`bun run api:types`); never edit it by hand.
 * These helpers turn "path + method" into the exact path params, query, body and response of that call,
 * so a wrong field or a missing ID is a type error, not a runtime surprise.
 */
import type { components, paths } from "./schema";
import type { ApiError } from "./errors";

export type Schemas = components["schemas"];
export type PageMeta = Schemas["PageMeta"];

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/** The API paths that accept `method`, e.g. PathWith<"get"> includes "/api/v1/admin/traders". */
export type PathWith<M extends HttpMethod> = {
  [P in keyof paths]: paths[P][M] extends undefined ? never : P;
}[keyof paths];

export type Operation<P extends keyof paths, M extends HttpMethod> = NonNullable<paths[P][M]>;

type PathParamsOf<O> = O extends { parameters: { path: infer T } } ? T : never;
type QueryOf<O> = O extends { parameters: { query?: infer T } } ? ([T] extends [never] ? never : NonNullable<T>) : never;
type JsonBodyOf<O> = O extends { requestBody: { content: { "application/json": infer B } } } ? B : never;

type ResponsesOf<O> = O extends { responses: infer R } ? R : never;
type JsonOf<R> = R extends { content: { "application/json": infer J } } ? J : undefined;
/** The success body ({ data, meta }) of 200/201 answers; undefined for 204 (no content). */
type SuccessBodyOf<O> = JsonOf<ResponsesOf<O>[Extract<keyof ResponsesOf<O>, 200 | 201 | 204>]>;

export type DataOf<O> = SuccessBodyOf<O> extends { data: infer D } ? D : undefined;
export type MetaOf<O> = SuccessBodyOf<O> extends { meta: infer M } ? M : undefined;

/** Options for one call: path params and body are required exactly when the contract requires them. */
export type RequestOptions<O> = { signal?: AbortSignal } & ([PathParamsOf<O>] extends [never]
  ? { path?: undefined }
  : { path: PathParamsOf<O> }) &
  ([QueryOf<O>] extends [never] ? { query?: undefined } : { query?: QueryOf<O> }) &
  ([JsonBodyOf<O>] extends [never] ? { body?: undefined } : { body: JsonBodyOf<O> });

/** Lets callers leave out the options argument when nothing in it is required. */
export type OptionsArg<T> = object extends T ? [options?: T] : [options: T];

export type ApiSuccess<D, M> = { ok: true; status: number; data: D; meta: M };
export type ApiFailure = { ok: false; error: ApiError };
/** Every call returns a result instead of throwing: expected errors are values (Next.js error-handling guide). */
export type ApiResult<D, M = undefined> = ApiSuccess<D, M> | ApiFailure;

export type ResultOf<P extends keyof paths, M extends HttpMethod> = ApiResult<DataOf<Operation<P, M>>, MetaOf<Operation<P, M>>>;
