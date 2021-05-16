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

export * from "./error";
