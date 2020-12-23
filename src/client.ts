import { VERSION } from "./version";
import { IHaxanOptions, IHaxanResponse, RejectionFunction } from "./interfaces";
import {
  HTTPMethod,
  ResponseType,
  HaxanRejection,
  HaxanAbort,
  HaxanTimeout,
} from "./types";
import {
  isBrowser,
  stringifyQuery,
  normalizeHeaders,
  canHaveBody,
} from "./util";

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
    rejectOn: () => false,
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

  rejectOn(func: RejectionFunction): this {
    return this.setProp("rejectOn", func);
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
    return JSON.stringify(body);
  }

  private async parseBody(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.startsWith("application/json")) {
      return <T>(<unknown>await res.json());
    }
    return <T>(<unknown>await res.text());
  }

  send(): Promise<IHaxanResponse<T>> {
    return this.request();
  }

  async request(): Promise<IHaxanResponse<T>> {
    try {
      let fetchImplementation: (
        input: RequestInfo,
        init?: RequestInit,
      ) => Promise<Response>;

      const _isBrowser = isBrowser();

      if (_isBrowser) {
        fetchImplementation = fetch;
      } else {
        fetchImplementation = require("node-fetch");
      }

      const url = Object.keys(this._opts.query).length
        ? `${this._opts.url}?${stringifyQuery(this._opts.query)}`
        : this._opts.url;

      const res = <Response>await Promise.race([
        fetchImplementation(url, {
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
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new HaxanTimeout()), this._opts.timeout),
        ),
      ]);

      if (this._opts.rejectOn(res.status)) {
        throw new HaxanRejection(res);
      }

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
      } else if (this._opts.type === ResponseType.Stream && !_isBrowser) {
        return {
          data: <T>(<unknown>res.body),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      }

      throw new Error("No valid response body parsing method found");
    } catch (error) {
      if (error.name === "AbortError") {
        throw new HaxanAbort();
      }
      throw error;
    }
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
