/**
 * Thrown on internal errors
 */
declare class HaxanError extends Error {
    isHaxanError: boolean;
}
declare function isHaxanError(val: any): val is HaxanError;
/**
 * Thrown when the timeout limit is reached
 */
declare class HaxanTimeout extends HaxanError {
    isTimeout: boolean;
    constructor();
}
declare function isHaxanTimeout(val: any): val is HaxanError;
/**
 * Thrown when the custom rejectOn function evaluates to true
 */
declare class HaxanRejection extends HaxanError {
    isRejection: boolean;
    response: Response;
    constructor(res: Response);
}
declare function isHaxanRejection(val: any): val is HaxanError;
/**
 * Thrown when the request is aborted
 */
declare class HaxanAbort extends HaxanError {
    isAbort: boolean;
    constructor();
}
declare function isHaxanAbort(val: any): val is HaxanError;
/**
 * Response modes, defaults to auto.
 *
 * Auto parses to JSON when the Content-Type header is set to `application/json`
 * Otherwise the response body is returned as string
 *
 * Stream is only usable in Node.js
 */
declare enum ResponseType {
    Auto = "auto",
    Json = "json",
    Text = "text",
    Stream = "stream"
}
/**
 * HTTP methods
 */
declare enum HTTPMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Delete = "DELETE",
    Head = "HEAD",
    Options = "OPTIONS"
}

type types_HaxanError = HaxanError;
declare const types_HaxanError: typeof HaxanError;
declare const types_isHaxanError: typeof isHaxanError;
type types_HaxanTimeout = HaxanTimeout;
declare const types_HaxanTimeout: typeof HaxanTimeout;
declare const types_isHaxanTimeout: typeof isHaxanTimeout;
type types_HaxanRejection = HaxanRejection;
declare const types_HaxanRejection: typeof HaxanRejection;
declare const types_isHaxanRejection: typeof isHaxanRejection;
type types_HaxanAbort = HaxanAbort;
declare const types_HaxanAbort: typeof HaxanAbort;
declare const types_isHaxanAbort: typeof isHaxanAbort;
type types_ResponseType = ResponseType;
declare const types_ResponseType: typeof ResponseType;
type types_HTTPMethod = HTTPMethod;
declare const types_HTTPMethod: typeof HTTPMethod;
declare namespace types {
  export {
    types_HaxanError as HaxanError,
    types_isHaxanError as isHaxanError,
    types_HaxanTimeout as HaxanTimeout,
    types_isHaxanTimeout as isHaxanTimeout,
    types_HaxanRejection as HaxanRejection,
    types_isHaxanRejection as isHaxanRejection,
    types_HaxanAbort as HaxanAbort,
    types_isHaxanAbort as isHaxanAbort,
    types_ResponseType as ResponseType,
    types_HTTPMethod as HTTPMethod,
  };
}

declare type RejectionFunction = (status: number) => boolean;
interface IHaxanOptions {
    url: string;
    method: string;
    headers: Record<string, string>;
    query: Record<string, unknown>;
    body: unknown;
    type: ResponseType;
    rejectOn: RejectionFunction;
    abortSignal?: AbortSignal;
    timeout: number;
}
interface IHaxanResponse<T> {
    data: T;
    ok: boolean;
    status: number;
    headers: Record<string, string>;
}

/**
 * Request factory, supports both options (given in constructor)
 * and a chainable API
 */
declare class HaxanFactory<T = unknown> {
    private _opts;
    constructor(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>);
    private setProp;
    rejectOn(func: RejectionFunction): this;
    url(url: string): this;
    type(type: ResponseType): this;
    method(method: string): this;
    get(): this;
    head(): this;
    options(): this;
    post(body: unknown): this;
    put(body: unknown): this;
    patch(body: unknown): this;
    delete(): this;
    body(body: unknown): this;
    header(name: string, value: string): this;
    param(name: string, value: unknown): this;
    timeout(ms: number): this;
    abort(sig: AbortSignal): this;
    private normalizedBody;
    private parseBody;
    send(): Promise<IHaxanResponse<T>>;
    request(): Promise<IHaxanResponse<T>>;
}
/**
 * Creates a new Haxan instance
 */
declare function createHaxanFactory<T>(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>): HaxanFactory<T>;

declare const _default: typeof createHaxanFactory & typeof types & {
    HaxanFactory: typeof HaxanFactory;
};

export default _default;
export { IHaxanOptions, IHaxanResponse, RejectionFunction };
