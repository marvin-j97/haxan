/**
 * Response modes, defaults to auto.
 *
 * Auto parses to JSON when the Content-Type header is set to `application/json`
 * Otherwise the response body is returned as string
 *
 * Stream is only usable in Node.js
 */
export enum ResponseType {
  Auto = "auto",
  Json = "json",
  Text = "text",
  Stream = "stream",
  Blob = "blob",
  ArrayBuffer = "arraybuffer",
}

/**
 * HTTP methods
 */
export enum HTTPMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
  Head = "HEAD",
  Options = "OPTIONS",
}

export interface IHaxanOptions {
  url: string;
  method: HTTPMethod | string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  type: ResponseType;
  abortSignal?: AbortSignal;
  timeout: number;
  redirect: "follow" | "manual";
}

export interface IHaxanResponse<T> {
  data: T;
  ok: boolean;
  status: number;
  headers: Record<string, string>;
}

export * from "./error";
