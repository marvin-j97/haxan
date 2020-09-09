/**
 * Thrown on internal errors
 */
export class HaxanError extends Error {
  isHaxanError = true;
}

/**
 * Thrown when the timeout limit is reached
 */
export class HaxanTimeout extends HaxanError {
  isTimeout = true;

  constructor() {
    super();
  }
}

/**
 * Thrown when the custom rejectOn function evaluates to true
 */
export class HaxanRejection extends HaxanError {
  isRejection = true;
  response: Response;

  constructor(res: Response) {
    super();
    this.response = res;
  }
}

/**
 * Thrown when the request is aborted
 */
export class HaxanAbort extends HaxanError {
  isAbort = true;

  constructor() {
    super();
  }
}

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
