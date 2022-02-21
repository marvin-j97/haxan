import { VERSION } from "./version";
import {
  HTTPMethod,
  ResponseType,
  HaxanError,
  HaxanErrorType,
  IHaxanOptions,
  IHaxanResponse,
} from "./types";
import {
  isBrowser,
  stringifyQuery,
  normalizeHeaders,
  canHaveBody,
} from "./util";

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
  private _fetch: typeof fetch;
  private _opts: IHaxanOptions = {
    url: "",
    headers: {},
    query: {},
    method: HTTPMethod.Get,
    body: undefined,
    type: ResponseType.Auto,
    abortSignal: undefined,
    timeout: 30000,
    redirect: "follow",
  };
  private _addOptions: Record<string, unknown> = {};

  constructor(
    url: string,
    _fetch?: any,
    opts?: Partial<Omit<IHaxanOptions, "url">>,
  ) {
    if (opts) {
      Object.assign(this._opts, opts);
    }
    this._fetch = _fetch || fetch;
    this.url(url);
  }

  private setProp<K extends keyof IHaxanOptions>(
    key: K,
    value: IHaxanOptions[K],
  ) {
    this._opts[key] = value;
    return this;
  }

  redirect(value: "follow" | "manual") {
    return this.setProp("redirect", value);
  }

  addOptions<T extends Record<string, unknown>>(opts: T) {
    this._addOptions = opts;
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
    return this.method(HTTPMethod.Get);
  }

  head(): this {
    return this.method(HTTPMethod.Head);
  }

  options(): this {
    return this.method(HTTPMethod.Options);
  }

  post(body: unknown): this {
    return this.body(body).method(HTTPMethod.Post);
  }

  put(body: unknown): this {
    return this.body(body).method(HTTPMethod.Put);
  }

  patch(body: unknown): this {
    return this.body(body).method(HTTPMethod.Patch);
  }

  delete(): this {
    return this.method(HTTPMethod.Delete);
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
      } else if (this._opts.type === ResponseType.Blob) {
        return {
          data: <T>(<unknown>await res.blob()),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      } else if (this._opts.type === ResponseType.ArrayBuffer) {
        return {
          data: <T>(<unknown>await res.arrayBuffer()),
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
    } catch (error: any) {
      if (error.type === HaxanErrorType.ParseError) {
        throw error;
      }
      throw new Error(`Error during parsing response body: ${error.message}`);
    }
  }

  private buildUrl(): string {
    return Object.keys(this._opts.query).length
      ? `${this._opts.url}?${stringifyQuery(this._opts.query)}`
      : this._opts.url;
  }

  private async doRequest<T>(): Promise<IHaxanResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this._opts.headers,
      };

      if (typeof window === "undefined") {
        headers["User-Agent"] = `Haxan ${VERSION}`;
      }

      const res: Response = await this._fetch(this.buildUrl(), {
        method: this._opts.method,
        headers,
        body: canHaveBody(this._opts.method)
          ? this.normalizedBody()
          : undefined,
        signal: this._opts.abortSignal,
        redirect: this._opts.redirect,
        ...this._addOptions,
      });
      const parsed = await this.parseResponse(res);
      return <IHaxanResponse<T>>(<unknown>parsed);
    } catch (error: any) {
      if (error.getType) {
        throw error;
      }
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
  _fetch?: any,
  opts?: Partial<Omit<IHaxanOptions, "url">>,
): HaxanFactory<T> {
  return new HaxanFactory(url, _fetch, opts);
}
