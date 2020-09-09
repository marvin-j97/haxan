function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    {}.toString.call(window) === "[object Window]"
  );
}

function stringifyQuery(params: Record<string, unknown>) {
  return Object.keys(params)
    .map((key) => key + "=" + String(params[key]))
    .join("&");
}

export enum ResponseType {
  Auto,
  Json,
  Text,
  Stream,
}

export interface IHaxanOptions {
  url: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  type: ResponseType;
}

export enum HTTPMethods {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
  Head = "HEAD",
  Options = "OPTIONS",
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
    method: HTTPMethods.Get,
    body: undefined,
    type: ResponseType.Auto,
  };

  constructor(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>) {
    if (opts) {
      Object.assign(this._opts, opts);
    }
    this._opts.url = url;
  }

  private canHaveBody() {
    return (<string[]>[
      HTTPMethods.Put,
      HTTPMethods.Post,
      HTTPMethods.Patch,
    ]).includes(this._opts.method.toUpperCase());
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

  private normalizedBody() {
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
      const res = await fetchImplementation(url, {
        method: this._opts.method,
        headers: {
          "Content-Type": "application/json",
          ...this._opts.headers,
          "User-Agent": "Haxan 0.0.1",
        },
        body: this.canHaveBody() ? this.normalizedBody() : undefined,
      });

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
      throw new HaxanError(error);
    }
  }
}

export function createHaxanFactory<T>(
  url: string,
  opts?: Partial<Omit<IHaxanOptions, "url">>,
): HaxanFactory<T> {
  return new HaxanFactory(url, opts);
}
