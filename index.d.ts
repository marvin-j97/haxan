declare enum HaxanErrorType {
    NetworkError = "NetworkError",
    ParseError = "ParseError",
    Timeout = "Timeout",
    Abort = "Abort"
}
/**
 * Thrown on internal errors
 */
declare class HaxanError<T = unknown> {
    private type;
    private rawError;
    private response;
    private message;
    constructor(type: HaxanErrorType, message: string, originalError: Error | null, response?: IHaxanResponse<T>);
    getMessage(): string;
    getType(): HaxanErrorType;
    getOriginalError(): Error | null;
    getResponse(): IHaxanResponse<T> | null;
}

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
interface IHaxanOptions {
    url: string;
    method: string;
    headers: Record<string, string>;
    query: Record<string, unknown>;
    body: unknown;
    type: ResponseType;
    abortSignal?: AbortSignal;
    timeout: number;
}
interface IHaxanResponse<T> {
    data: T;
    ok: boolean;
    status: number;
    headers: Record<string, string>;
}

type types_ResponseType = ResponseType;
declare const types_ResponseType: typeof ResponseType;
type types_HTTPMethod = HTTPMethod;
declare const types_HTTPMethod: typeof HTTPMethod;
type types_IHaxanOptions = IHaxanOptions;
type types_IHaxanResponse<_0> = IHaxanResponse<_0>;
type types_HaxanErrorType = HaxanErrorType;
declare const types_HaxanErrorType: typeof HaxanErrorType;
type types_HaxanError<_0> = HaxanError<_0>;
declare const types_HaxanError: typeof HaxanError;
declare namespace types {
  export {
    types_ResponseType as ResponseType,
    types_HTTPMethod as HTTPMethod,
    types_IHaxanOptions as IHaxanOptions,
    types_IHaxanResponse as IHaxanResponse,
    types_HaxanErrorType as HaxanErrorType,
    types_HaxanError as HaxanError,
  };
}

/**
 * Request factory, supports both options (given in constructor)
 * and a chainable API
 */
declare class HaxanFactory<T = unknown> {
    private _opts;
    constructor(url: string, opts?: Partial<Omit<IHaxanOptions, "url">>);
    private setProp;
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
    getOptions(): IHaxanOptions;
    send(): Promise<IHaxanResponse<T>>;
    execute(): Promise<IHaxanResponse<T>>;
    private parseResponse;
    private buildUrl;
    private doRequest;
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
export { HTTPMethod, HaxanError, HaxanErrorType, HaxanFactory, IHaxanOptions, IHaxanResponse, ResponseType };
