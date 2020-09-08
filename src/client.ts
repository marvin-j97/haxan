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
}

export class HaxanError extends Error {
  isHaxanError = true;
}

export interface IHaxanResponse<T> {
  data: T;
  ok: boolean;
  status: number;
}

export class HaxanFactory<T = unknown> {
  private _opts: IHaxanOptions = {
    url: "",
    headers: {},
    query: {},
    method: "GET",
  };

  constructor(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>) {
    if (opts) {
      Object.assign(this._opts, opts);
    }
    this._opts.url = url;
  }

  method(method: string): HaxanFactory<T> {
    this._opts.method = method;
    return this;
  }

  get(): HaxanFactory<T> {
    return this.method("GET");
  }

  post(): HaxanFactory<T> {
    return this.method("POST");
  }

  put(): HaxanFactory<T> {
    return this.method("PUT");
  }

  patch(): HaxanFactory<T> {
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
        headers: this._opts.headers,
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.startsWith("application/json")) {
        return {
          data: await res.json(),
          ok: res.ok,
          status: res.status,
        };
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: <any>await res.text(),
        ok: res.ok,
        status: res.status,
      };
    } catch (error) {
      throw new HaxanError(error);
    }
  }
}

export function createHaxanFactory<T>(url: string): HaxanFactory<T> {
  return new HaxanFactory(url);
}
