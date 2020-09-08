import { stringify as stringifyQuery } from "query-string";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    {}.toString.call(window) === "[object Window]"
  );
}

interface IHaxanOptions {
  url: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
}

enum HTTPMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export class HaxanError extends Error {
  isHaxanError = true;
}

export interface IHaxanResponse<T> {
  data: T;
  ok: boolean;
  status: number;
  headers: Record<string, string>;
}

function normalizeHeaders(headers: Headers) {
  const normalized = {} as Record<string, string>;
  headers.forEach((v, k) => {
    normalized[k] = v;
  });
  return normalized;
}

export class HaxanFactory<T = unknown> {
  private _opts: IHaxanOptions = {
    url: "",
    headers: {},
    query: {},
    method: HTTPMethods.GET,
    body: undefined,
  };

  constructor(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>) {
    if (opts) {
      Object.assign(this._opts, opts);
    }
    this._opts.url = url;
  }

  private canHaveBody() {
    return (<string[]>[
      HTTPMethods.PUT,
      HTTPMethods.POST,
      HTTPMethods.PATCH,
    ]).includes(this._opts.method.toUpperCase());
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

  private normalizedBody() {
    const body = this._opts.body;
    if (body === null) {
      return "";
    }
    return JSON.stringify(body);
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

      if (isBrowser()) {
        fetchImplementation = fetch;
      } else {
        fetchImplementation = require("node-fetch");
      }

      const url = `${this._opts.url}?${stringifyQuery(this._opts.query)}`;
      const res = await fetchImplementation(url, {
        method: this._opts.method,
        headers: {
          "Content-Type": "application/json",
          ...this._opts.headers,
          "X-Http-Client": "Haxan 0.0.1",
        },
        body: this.canHaveBody() ? this.normalizedBody() : undefined,
      });

      const contentType = res.headers.get("content-type");
      const resHeaders = normalizeHeaders(res.headers);

      if (contentType && contentType.startsWith("application/json")) {
        return {
          data: await res.json(),
          ok: res.ok,
          status: res.status,
          headers: resHeaders,
        };
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: <any>await res.text(),
        ok: res.ok,
        status: res.status,
        headers: resHeaders,
      };
    } catch (error) {
      throw new HaxanError(error);
    }
  }
}

export function createHaxanFactory<T>(url: string): HaxanFactory<T> {
  return new HaxanFactory(url);
}
