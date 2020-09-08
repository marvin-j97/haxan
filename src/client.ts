import { stringify as stringifyQuery } from "query-string";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    {}.toString.call(window) === "[object Window]"
  );
}

export class HaxanError extends Error {
  isHaxanError = true;
}

export interface IHaxanResponse<T> {
  data: T;
  ok: boolean;
  status: number;
}

export class HaxanFactory<T> {
  private _url: string;
  private _method: string = "GET";
  private _headers: Record<string, string> = {};
  private _query: Record<string, unknown> = {};

  constructor(url: string) {
    this._url = url;
  }

  method(method: string): HaxanFactory<T> {
    this._method = method;
    return this;
  }

  get() {
    return this.method("GET");
  }

  post() {
    return this.method("POST");
  }

  put() {
    return this.method("PUT");
  }

  patch() {
    return this.method("PATCH");
  }

  delete() {
    return this.method("DELETE");
  }

  header(name: string, value: string): HaxanFactory<T> {
    this._headers[name] = value;
    return this;
  }

  param(name: string, value: unknown): HaxanFactory<T> {
    this._query[name] = value;
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

      const url = `${this._url}?${stringifyQuery(this._query)}`;
      const res = await fetchImplementation(url, {
        method: this._method,
        headers: this._headers,
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
        data: <any>await res.text(),
        ok: res.ok,
        status: res.status,
      };
    } catch (error) {
      throw new HaxanError(error);
    }
  }
}

export function createHaxanFactory<T = any>(url: string): HaxanFactory<T> {
  return new HaxanFactory(url);
}
