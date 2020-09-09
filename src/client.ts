import { IHaxanOptions, IHaxanResponse } from "./interfaces";
import {
  HTTPMethod,
  ResponseType,
  HaxanError,
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
 *
 * ```typescript
 * // Send a GET request to Google
 * await Haxan("https://google.com").request();
 * // .request (alias .send) starts the request
 *
 * // Send some JSON payload
 * const createNoteUrl = "http://localhost:3000/note/my-new-object"
 * const payload = {
 *  note: "Test string",
 *  createdAt: 512525125
 * }
 * await Haxan(createNoteUrl).put(payload).send();
 *
 * // JSON POST using Option API instead
 * await Haxan(createNoteUrl, {
 *   body: payload,
 *   method: Haxan.HTTPMethod.Post
 * }).request();
 *
 * // Use a different Content-Type instead
 * await Haxan(createNoteUrl)
 *   .header("Content-Type", "application/yaml")
 *   .put(`
 *   ---
 *     message: I hope this is valid YAML
 *   `).send();
 * ```
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
    this._opts.url = url;
  }

  type(type: ResponseType): HaxanFactory<T> {
    this._opts.type = type;
    return this;
  }

  method(method: string): HaxanFactory<T> {
    this._opts.method = method;
    return this;
  }

  get(): HaxanFactory<T> {
    return this.method("GET");
  }

  head(): HaxanFactory<T> {
    return this.method("HEAD");
  }

  options(): HaxanFactory<T> {
    return this.method("OPTIONS");
  }

  post(body: unknown): HaxanFactory<T> {
    this._opts.body = body;
    return this.method("POST");
  }

  put(body: unknown): HaxanFactory<T> {
    this._opts.body = body;
    return this.method("PUT");
  }

  patch(body: unknown): HaxanFactory<T> {
    this._opts.body = body;
    return this.method("PATCH");
  }

  delete(): HaxanFactory<T> {
    return this.method("DELETE");
  }

  header(name: string, value: string): HaxanFactory<T> {
    this._opts.headers[name] = value;
    return this;
  }

  param(name: string, value: unknown): HaxanFactory<T> {
    this._opts.query[name] = value;
    return this;
  }

  timeout(ms: number): HaxanFactory<T> {
    this._opts.timeout = ms;
    return this;
  }

  private normalizedBody(): string {
    const body = this._opts.body;
    if (body === null) {
      return "";
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

      const url = `${this._opts.url}?${stringifyQuery(this._opts.query)}`;
      const res = <Response>await Promise.race([
        fetchImplementation(url, {
          method: this._opts.method,
          headers: {
            "Content-Type": "application/json",
            ...this._opts.headers,
            "User-Agent": "Haxan 0.0.1",
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
      if (error.isHaxanError) {
        throw error;
      }
      if (error.name === "AbortError") {
        throw new HaxanAbort();
      }
      throw new HaxanError(error.message);
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
