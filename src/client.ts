import { VERSION } from "./version";
import { IHaxanOptions, IHaxanResponse } from "./interfaces";
import { HTTPMethod, ResponseType, HaxanError, HaxanErrorType } from "./types";
import {
  isBrowser,
  stringifyQuery,
  normalizeHeaders,
  canHaveBody,
} from "./util";

type FetchFunction = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

function timeout(timeMs: number): Promise<void> {
  return new Promise((_resolve, reject) =>
    setTimeout(
      () =>
        reject(
          new HaxanError(
            HaxanErrorType.Timeout,
            `Request timed out (Reached ${timeMs}ms)`,
            null,
          ),
        ),
      timeMs,
    ),
  );
}

/**
 * Request factory, supports both options (given in constructor)
 * and a chainable API
 */
export class HaxanFactory<T = unknown> {
  private _opts: IHaxanOptions = {
    url: "",
    headers: {},
    query: {},
    method: HTTPMethod.Get,
    body: undefined,
    type: ResponseType.Auto,
    abortSignal: undefined,
    timeout: 30000,
  };

  constructor(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>) {
    if (opts) {
      Object.assign(this._opts, opts);
    }
    this.url(url);
  }

  private setProp<K extends keyof IHaxanOptions>(
    key: K,
    value: IHaxanOptions[K],
  ) {
    this._opts[key] = value;
    return this;
  }

  url(url: string): this {
    return this.setProp("url", url);
  }

  type(type: ResponseType): this {
    return this.setProp("type", type);
  }

  method(method: string): this {
    return this.setProp("method", method);
  }

  get(): this {
    return this.method("GET");
  }

  head(): this {
    return this.method("HEAD");
  }

  options(): this {
    return this.method("OPTIONS");
  }

  post(body: unknown): this {
    return this.body(body).method("POST");
  }

  put(body: unknown): this {
    return this.body(body).method("PUT");
  }

  patch(body: unknown): this {
    return this.body(body).method("PATCH");
  }

  delete(): this {
    return this.method("DELETE");
  }

  body(body: unknown): this {
    return this.setProp("body", body);
  }

  header(name: string, value: string): this {
    this._opts.headers[name] = value;
    return this;
  }

  param(name: string, value: unknown): this {
    this._opts.query[name] = value;
    return this;
  }

  timeout(ms: number): this {
    return this.setProp("timeout", ms);
  }

  abort(sig: AbortSignal): this {
    return this.setProp("abortSignal", sig);
  }

  private normalizedBody(): string | null {
    const body = this._opts.body;
    if (body === null) {
      return null;
    }
    if (typeof body === "string") {
      return body;
    }
    return JSON.stringify(body);
  }

  private async parseBody(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.startsWith("application/json")) {
      return <T>(<unknown>await res.json());
    }
    return <T>(<unknown>await res.text());
  }

  getOptions(): IHaxanOptions {
    return this._opts;
  }

  send(): Promise<IHaxanResponse<T>> {
    return this.execute();
  }

  execute(): Promise<IHaxanResponse<T>> {
    return this.request();
  }

  private async parseResponse(res: Response): Promise<IHaxanResponse<T>> {
    try {
      const resHeaders = normalizeHeaders(res.headers);

      if (this._opts.type === ResponseType.Auto) {
        return {
          data: await this.parseBody(res),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      } else if (this._opts.type === ResponseType.Json) {
        return {
          data: await res.json(),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      } else if (this._opts.type === ResponseType.Text) {
        return {
          data: <T>(<unknown>await res.text()),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      } else if (this._opts.type === ResponseType.Stream && !isBrowser()) {
        return {
          data: <T>(<unknown>res.body),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      }

      throw new HaxanError(
        HaxanErrorType.ParseError,
        "No valid response body parsing method found",
        null,
        {
          data: res.body,
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        },
      );
    } catch (error) {
      throw new Error("Error during parsing response body");
    }
  }

  private buildUrl(): string {
    return Object.keys(this._opts.query).length
      ? `${this._opts.url}?${stringifyQuery(this._opts.query)}`
      : this._opts.url;
  }

  private async doRequest<T>(): Promise<IHaxanResponse<T>> {
    try {
      const fetchImplementation: FetchFunction = isBrowser()
        ? fetch
        : require("node-fetch");

      const res = await fetchImplementation(this.buildUrl(), {
        method: this._opts.method,
        headers: {
          "Content-Type": "application/json",
          ...this._opts.headers,
          "User-Agent": `Haxan ${VERSION}`,
        },
        body: canHaveBody(this._opts.method)
          ? this.normalizedBody()
          : undefined,
        signal: this._opts.abortSignal,
      });
      const parsed = await this.parseResponse(res);
      return <IHaxanResponse<T>>(<unknown>parsed);
    } catch (_error) {
      const error: Error = _error;

      if (error.name === "AbortError") {
        throw new HaxanError(HaxanErrorType.Abort, "Request aborted", error);
      }
      throw new HaxanError(HaxanErrorType.NetworkError, "Network error", error);
    }
  }

  async request(): Promise<IHaxanResponse<T>> {
    const res = <IHaxanResponse<T>>await Promise.race([
      // Real request promise
      this.doRequest(),
      // Timeout promise
      timeout(this._opts.timeout),
    ]);

    return res;
  }
}

/**
 * Creates a new Haxan instance
 */
export function createHaxanFactory<T>(
  url: string,
  opts?: Partial<Omit<IHaxanOptions, "url">>,
): HaxanFactory<T> {
  return new HaxanFactory(url, opts);
}
