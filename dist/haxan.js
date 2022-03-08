(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Haxan = {}));
}(this, (function (exports) { 'use strict';

    function toString(val) {
        var value = String(val);
        if (value === '[object Object]') {
            try {
                value = JSON.stringify(val);
            }
            catch (_a) { }
        }
        return value;
    }

    /**
     * Contains the None value
     */
    var NoneImpl = /** @class */ (function () {
        function NoneImpl() {
            this.some = false;
            this.none = true;
        }
        NoneImpl.prototype[Symbol.iterator] = function () {
            return {
                next: function () {
                    return { done: true, value: undefined };
                },
            };
        };
        NoneImpl.prototype.unwrapOr = function (val) {
            return val;
        };
        NoneImpl.prototype.expect = function (msg) {
            throw new Error("" + msg);
        };
        NoneImpl.prototype.unwrap = function () {
            throw new Error("Tried to unwrap None");
        };
        NoneImpl.prototype.map = function (_mapper) {
            return this;
        };
        NoneImpl.prototype.andThen = function (op) {
            return this;
        };
        NoneImpl.prototype.toResult = function (error) {
            return Err(error);
        };
        NoneImpl.prototype.toString = function () {
            return 'None';
        };
        return NoneImpl;
    }());
    // Export None as a singleton, then freeze it so it can't be modified
    var None = new NoneImpl();
    Object.freeze(None);
    /**
     * Contains the success value
     */
    var SomeImpl = /** @class */ (function () {
        function SomeImpl(val) {
            if (!(this instanceof SomeImpl)) {
                return new SomeImpl(val);
            }
            this.some = true;
            this.none = false;
            this.val = val;
        }
        /**
         * Helper function if you know you have an Some<T> and T is iterable
         */
        SomeImpl.prototype[Symbol.iterator] = function () {
            var obj = Object(this.val);
            return Symbol.iterator in obj
                ? obj[Symbol.iterator]()
                : {
                    next: function () {
                        return { done: true, value: undefined };
                    },
                };
        };
        SomeImpl.prototype.unwrapOr = function (_val) {
            return this.val;
        };
        SomeImpl.prototype.expect = function (_msg) {
            return this.val;
        };
        SomeImpl.prototype.unwrap = function () {
            return this.val;
        };
        SomeImpl.prototype.map = function (mapper) {
            return Some(mapper(this.val));
        };
        SomeImpl.prototype.andThen = function (mapper) {
            return mapper(this.val);
        };
        SomeImpl.prototype.toResult = function (error) {
            return Ok(this.val);
        };
        /**
         * Returns the contained `Some` value, but never throws.
         * Unlike `unwrap()`, this method doesn't throw and is only callable on an Some<T>
         *
         * Therefore, it can be used instead of `unwrap()` as a maintainability safeguard
         * that will fail to compile if the type of the Option is later changed to a None that can actually occur.
         *
         * (this is the `into_Some()` in rust)
         */
        SomeImpl.prototype.safeUnwrap = function () {
            return this.val;
        };
        SomeImpl.prototype.toString = function () {
            return "Some(" + toString(this.val) + ")";
        };
        SomeImpl.EMPTY = new SomeImpl(undefined);
        return SomeImpl;
    }());
    // This allows Some to be callable - possible because of the es5 compilation target
    var Some = SomeImpl;
    var Option;
    (function (Option) {
        /**
         * Parse a set of `Option`s, returning an array of all `Some` values.
         * Short circuits with the first `None` found, if any
         */
        function all() {
            var options = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                options[_i] = arguments[_i];
            }
            var someOption = [];
            for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
                var option = options_1[_a];
                if (option.some) {
                    someOption.push(option.val);
                }
                else {
                    return option;
                }
            }
            return Some(someOption);
        }
        Option.all = all;
        /**
         * Parse a set of `Option`s, short-circuits when an input value is `Some`.
         * If no `Some` is found, returns `None`.
         */
        function any() {
            var options = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                options[_i] = arguments[_i];
            }
            // short-circuits
            for (var _a = 0, options_2 = options; _a < options_2.length; _a++) {
                var option = options_2[_a];
                if (option.some) {
                    return option;
                }
                else {
                    return option;
                }
            }
            // it must be None
            return None;
        }
        Option.any = any;
        function isOption(value) {
            return value instanceof Some || value === None;
        }
        Option.isOption = isOption;
    })(Option || (Option = {}));

    /**
     * Contains the error value
     */
    var ErrImpl = /** @class */ (function () {
        function ErrImpl(val) {
            if (!(this instanceof ErrImpl)) {
                return new ErrImpl(val);
            }
            this.ok = false;
            this.err = true;
            this.val = val;
            var stackLines = new Error().stack.split('\n').slice(2);
            if (stackLines && stackLines.length > 0 && stackLines[0].includes('ErrImpl')) {
                stackLines.shift();
            }
            this._stack = stackLines.join('\n');
        }
        ErrImpl.prototype[Symbol.iterator] = function () {
            return {
                next: function () {
                    return { done: true, value: undefined };
                },
            };
        };
        /**
         * @deprecated in favor of unwrapOr
         * @see unwrapOr
         */
        ErrImpl.prototype.else = function (val) {
            return val;
        };
        ErrImpl.prototype.unwrapOr = function (val) {
            return val;
        };
        ErrImpl.prototype.expect = function (msg) {
            throw new Error(msg + " - Error: " + toString(this.val) + "\n" + this._stack);
        };
        ErrImpl.prototype.unwrap = function () {
            throw new Error("Tried to unwrap Error: " + toString(this.val) + "\n" + this._stack);
        };
        ErrImpl.prototype.map = function (_mapper) {
            return this;
        };
        ErrImpl.prototype.andThen = function (op) {
            return this;
        };
        ErrImpl.prototype.mapErr = function (mapper) {
            return new Err(mapper(this.val));
        };
        ErrImpl.prototype.toOption = function () {
            return None;
        };
        ErrImpl.prototype.toString = function () {
            return "Err(" + toString(this.val) + ")";
        };
        Object.defineProperty(ErrImpl.prototype, "stack", {
            get: function () {
                return this + "\n" + this._stack;
            },
            enumerable: false,
            configurable: true
        });
        /** An empty Err */
        ErrImpl.EMPTY = new ErrImpl(undefined);
        return ErrImpl;
    }());
    // This allows Err to be callable - possible because of the es5 compilation target
    var Err = ErrImpl;
    /**
     * Contains the success value
     */
    var OkImpl = /** @class */ (function () {
        function OkImpl(val) {
            if (!(this instanceof OkImpl)) {
                return new OkImpl(val);
            }
            this.ok = true;
            this.err = false;
            this.val = val;
        }
        /**
         * Helper function if you know you have an Ok<T> and T is iterable
         */
        OkImpl.prototype[Symbol.iterator] = function () {
            var obj = Object(this.val);
            return Symbol.iterator in obj
                ? obj[Symbol.iterator]()
                : {
                    next: function () {
                        return { done: true, value: undefined };
                    },
                };
        };
        /**
         * @see unwrapOr
         * @deprecated in favor of unwrapOr
         */
        OkImpl.prototype.else = function (_val) {
            return this.val;
        };
        OkImpl.prototype.unwrapOr = function (_val) {
            return this.val;
        };
        OkImpl.prototype.expect = function (_msg) {
            return this.val;
        };
        OkImpl.prototype.unwrap = function () {
            return this.val;
        };
        OkImpl.prototype.map = function (mapper) {
            return new Ok(mapper(this.val));
        };
        OkImpl.prototype.andThen = function (mapper) {
            return mapper(this.val);
        };
        OkImpl.prototype.mapErr = function (_mapper) {
            return this;
        };
        OkImpl.prototype.toOption = function () {
            return Some(this.val);
        };
        /**
         * Returns the contained `Ok` value, but never throws.
         * Unlike `unwrap()`, this method doesn't throw and is only callable on an Ok<T>
         *
         * Therefore, it can be used instead of `unwrap()` as a maintainability safeguard
         * that will fail to compile if the error type of the Result is later changed to an error that can actually occur.
         *
         * (this is the `into_ok()` in rust)
         */
        OkImpl.prototype.safeUnwrap = function () {
            return this.val;
        };
        OkImpl.prototype.toString = function () {
            return "Ok(" + toString(this.val) + ")";
        };
        OkImpl.EMPTY = new OkImpl(undefined);
        return OkImpl;
    }());
    // This allows Ok to be callable - possible because of the es5 compilation target
    var Ok = OkImpl;
    var Result;
    (function (Result) {
        /**
         * Parse a set of `Result`s, returning an array of all `Ok` values.
         * Short circuits with the first `Err` found, if any
         */
        function all() {
            var results = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                results[_i] = arguments[_i];
            }
            var okResult = [];
            for (var _a = 0, results_1 = results; _a < results_1.length; _a++) {
                var result = results_1[_a];
                if (result.ok) {
                    okResult.push(result.val);
                }
                else {
                    return result;
                }
            }
            return new Ok(okResult);
        }
        Result.all = all;
        /**
         * Parse a set of `Result`s, short-circuits when an input value is `Ok`.
         * If no `Ok` is found, returns an `Err` containing the collected error values
         */
        function any() {
            var results = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                results[_i] = arguments[_i];
            }
            var errResult = [];
            // short-circuits
            for (var _a = 0, results_2 = results; _a < results_2.length; _a++) {
                var result = results_2[_a];
                if (result.ok) {
                    return result;
                }
                else {
                    errResult.push(result.val);
                }
            }
            // it must be a Err
            return new Err(errResult);
        }
        Result.any = any;
        /**
         * Wrap an operation that may throw an Error (`try-catch` style) into checked exception style
         * @param op The operation function
         */
        function wrap(op) {
            try {
                return new Ok(op());
            }
            catch (e) {
                return new Err(e);
            }
        }
        Result.wrap = wrap;
        /**
         * Wrap an async operation that may throw an Error (`try-catch` style) into checked exception style
         * @param op The operation function
         */
        function wrapAsync(op) {
            try {
                return op()
                    .then(function (val) { return new Ok(val); })
                    .catch(function (e) { return new Err(e); });
            }
            catch (e) {
                return Promise.resolve(new Err(e));
            }
        }
        Result.wrapAsync = wrapAsync;
        function isResult(val) {
            return val instanceof Err || val instanceof Ok;
        }
        Result.isResult = isResult;
    })(Result || (Result = {}));

    exports.HaxanErrorType = void 0;
    (function (HaxanErrorType) {
        HaxanErrorType["NetworkError"] = "NetworkError";
        HaxanErrorType["ParseError"] = "ParseError";
        HaxanErrorType["Timeout"] = "Timeout";
        HaxanErrorType["Abort"] = "Abort";
    })(exports.HaxanErrorType || (exports.HaxanErrorType = {}));
    /**
     * Thrown on internal errors
     */
    var HaxanError = /** @class */ (function () {
        function HaxanError(type, message, originalError, response) {
            this.rawError = null;
            this.response = null;
            this.message = message;
            this.type = type;
            if (originalError) {
                this.rawError = originalError;
            }
            if (response) {
                this.response = response;
            }
        }
        HaxanError.prototype.getMessage = function () {
            return this.message;
        };
        HaxanError.prototype.getType = function () {
            return this.type;
        };
        HaxanError.prototype.getOriginalError = function () {
            return this.rawError;
        };
        HaxanError.prototype.getResponse = function () {
            return this.response;
        };
        return HaxanError;
    }());

    /**
     * Response modes, defaults to auto.
     *
     * Auto parses to JSON when the Content-Type header is set to `application/json`
     * Otherwise the response body is returned as string
     *
     * Stream is only usable in Node.js
     */
    exports.ResponseType = void 0;
    (function (ResponseType) {
        ResponseType["Auto"] = "auto";
        ResponseType["Json"] = "json";
        ResponseType["Text"] = "text";
        ResponseType["Stream"] = "stream";
        ResponseType["Blob"] = "blob";
        ResponseType["ArrayBuffer"] = "arraybuffer";
    })(exports.ResponseType || (exports.ResponseType = {}));
    /**
     * HTTP methods
     */
    exports.HTTPMethod = void 0;
    (function (HTTPMethod) {
        HTTPMethod["Get"] = "GET";
        HTTPMethod["Post"] = "POST";
        HTTPMethod["Put"] = "PUT";
        HTTPMethod["Patch"] = "PATCH";
        HTTPMethod["Delete"] = "DELETE";
        HTTPMethod["Head"] = "HEAD";
        HTTPMethod["Options"] = "OPTIONS";
    })(exports.HTTPMethod || (exports.HTTPMethod = {}));

    var types = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get ResponseType () { return exports.ResponseType; },
        get HTTPMethod () { return exports.HTTPMethod; },
        get HaxanErrorType () { return exports.HaxanErrorType; },
        HaxanError: HaxanError
    });

    function isBrowser() {
        return (typeof window !== "undefined" &&
            {}.toString.call(window) === "[object Window]");
    }
    function stringifyQuery(params) {
        return Object.keys(params)
            .map(function (key) { return key + "=" + String(params[key]); })
            .join("&");
    }
    function normalizeHeaders(headers) {
        var normalized = {};
        headers.forEach(function (v, k) {
            normalized[k] = v;
        });
        return normalized;
    }

    var VERSION = "0.7.0-next.2";
    var userAgent = "Haxan " + VERSION;

    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    function timeout(timeMs) {
        return new Promise(function (_resolve, reject) {
            return setTimeout(function () {
                return reject(new HaxanError(exports.HaxanErrorType.Timeout, "Request timed out (Reached " + timeMs + "ms)", null));
            }, timeMs);
        });
    }
    /**
     * Request factory, supports both options (given in constructor)
     * and a chainable API
     */
    var HaxanFactory = /** @class */ (function () {
        function HaxanFactory(url, _fetch) {
            this._opts = {
                url: "",
                headers: {},
                query: {},
                method: exports.HTTPMethod.Get,
                body: undefined,
                type: exports.ResponseType.Auto,
                abortSignal: undefined,
                timeout: 30000,
                redirect: "follow",
            };
            this._addOptions = {};
            this._fetch = _fetch || (function () { return fetch; });
            this.url(url);
        }
        HaxanFactory.prototype.setProp = function (key, value) {
            this._opts[key] = value;
            return this;
        };
        HaxanFactory.prototype.redirect = function (value) {
            return this.setProp("redirect", value);
        };
        HaxanFactory.prototype.addOptions = function (opts) {
            this._addOptions = opts;
            return this;
        };
        HaxanFactory.prototype.url = function (url) {
            return this.setProp("url", url);
        };
        HaxanFactory.prototype.type = function (type) {
            return this.setProp("type", type);
        };
        HaxanFactory.prototype.method = function (method) {
            return this.setProp("method", method);
        };
        HaxanFactory.prototype.get = function () {
            return this.method(exports.HTTPMethod.Get);
        };
        HaxanFactory.prototype.head = function () {
            return this.method(exports.HTTPMethod.Head);
        };
        HaxanFactory.prototype.options = function () {
            return this.method(exports.HTTPMethod.Options);
        };
        HaxanFactory.prototype.post = function (body) {
            return this.body(body).method(exports.HTTPMethod.Post);
        };
        HaxanFactory.prototype.put = function (body) {
            return this.body(body).method(exports.HTTPMethod.Put);
        };
        HaxanFactory.prototype.patch = function (body) {
            return this.body(body).method(exports.HTTPMethod.Patch);
        };
        HaxanFactory.prototype.delete = function () {
            return this.method(exports.HTTPMethod.Delete);
        };
        HaxanFactory.prototype.body = function (body) {
            return this.setProp("body", body);
        };
        HaxanFactory.prototype.header = function (name, value) {
            this._opts.headers[name] = value;
            return this;
        };
        HaxanFactory.prototype.param = function (name, value) {
            this._opts.query[name] = value;
            return this;
        };
        HaxanFactory.prototype.timeout = function (ms) {
            return this.setProp("timeout", ms);
        };
        HaxanFactory.prototype.abort = function (sig) {
            return this.setProp("abortSignal", sig);
        };
        HaxanFactory.prototype.normalizedBody = function () {
            var body = this._opts.body;
            if (body === null) {
                return null;
            }
            if (typeof body === "string") {
                return body;
            }
            return JSON.stringify(body);
        };
        HaxanFactory.prototype.parseBody = function (res) {
            return __awaiter(this, void 0, void 0, function () {
                var contentType;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            contentType = res.headers.get("content-type");
                            if (!(contentType && contentType.startsWith("application/json"))) return [3 /*break*/, 2];
                            return [4 /*yield*/, res.json()];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2: return [4 /*yield*/, res.text()];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        HaxanFactory.prototype.getOptions = function () {
            return this._opts;
        };
        HaxanFactory.prototype.parseResponse = function (res) {
            return __awaiter(this, void 0, void 0, function () {
                var resHeaders, error_1;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 12, , 13]);
                            resHeaders = normalizeHeaders(res.headers);
                            if (!(this._opts.type === exports.ResponseType.Auto)) return [3 /*break*/, 2];
                            _a = {};
                            return [4 /*yield*/, this.parseBody(res)];
                        case 1: return [2 /*return*/, (_a.data = _f.sent(),
                                _a.ok = res.ok,
                                _a.redirected = res.redirected,
                                _a.status = res.status,
                                _a.headers = resHeaders,
                                _a)];
                        case 2:
                            if (!(this._opts.type === exports.ResponseType.Json)) return [3 /*break*/, 4];
                            _b = {};
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, (_b.data = _f.sent(),
                                _b.ok = res.ok,
                                _b.redirected = res.redirected,
                                _b.status = res.status,
                                _b.headers = resHeaders,
                                _b)];
                        case 4:
                            if (!(this._opts.type === exports.ResponseType.Text)) return [3 /*break*/, 6];
                            _c = {};
                            return [4 /*yield*/, res.text()];
                        case 5: return [2 /*return*/, (_c.data = (_f.sent()),
                                _c.ok = res.ok,
                                _c.redirected = res.redirected,
                                _c.status = res.status,
                                _c.headers = resHeaders,
                                _c)];
                        case 6:
                            if (!(this._opts.type === exports.ResponseType.Blob)) return [3 /*break*/, 8];
                            _d = {};
                            return [4 /*yield*/, res.blob()];
                        case 7: return [2 /*return*/, (_d.data = (_f.sent()),
                                _d.ok = res.ok,
                                _d.redirected = res.redirected,
                                _d.status = res.status,
                                _d.headers = resHeaders,
                                _d)];
                        case 8:
                            if (!(this._opts.type === exports.ResponseType.ArrayBuffer)) return [3 /*break*/, 10];
                            _e = {};
                            return [4 /*yield*/, res.arrayBuffer()];
                        case 9: return [2 /*return*/, (_e.data = (_f.sent()),
                                _e.ok = res.ok,
                                _e.redirected = res.redirected,
                                _e.status = res.status,
                                _e.headers = resHeaders,
                                _e)];
                        case 10:
                            if (this._opts.type === exports.ResponseType.Stream && !isBrowser()) {
                                return [2 /*return*/, {
                                        data: res.body,
                                        ok: res.ok,
                                        redirected: res.redirected,
                                        status: res.status,
                                        headers: resHeaders,
                                    }];
                            }
                            _f.label = 11;
                        case 11: throw new HaxanError(exports.HaxanErrorType.ParseError, "No valid response body parsing method found", null, {
                            data: res.body,
                            ok: res.ok,
                            redirected: res.redirected,
                            status: res.status,
                            headers: resHeaders,
                        });
                        case 12:
                            error_1 = _f.sent();
                            if (error_1.type === exports.HaxanErrorType.ParseError) {
                                throw error_1;
                            }
                            throw new Error("Error during parsing response body: " + error_1.message);
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        HaxanFactory.prototype.buildUrl = function () {
            return Object.keys(this._opts.query).length
                ? this._opts.url + "?" + stringifyQuery(this._opts.query)
                : this._opts.url;
        };
        HaxanFactory.prototype.doRequest = function () {
            return __awaiter(this, void 0, void 0, function () {
                var headers, res, parsed, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            headers = __assign({ "Content-Type": "application/json" }, this._opts.headers);
                            if (typeof window === "undefined") {
                                headers["User-Agent"] = userAgent;
                            }
                            return [4 /*yield*/, this._fetch()(this.buildUrl(), __assign({ method: this._opts.method, headers: headers, body: this.normalizedBody(), signal: this._opts.abortSignal, redirect: this._opts.redirect }, this._addOptions))];
                        case 1:
                            res = _a.sent();
                            return [4 /*yield*/, this.parseResponse(res)];
                        case 2:
                            parsed = _a.sent();
                            return [2 /*return*/, parsed];
                        case 3:
                            error_2 = _a.sent();
                            if (error_2.getType) {
                                throw error_2;
                            }
                            if (error_2.name === "AbortError") {
                                throw new HaxanError(exports.HaxanErrorType.Abort, "Request aborted", error_2);
                            }
                            throw new HaxanError(exports.HaxanErrorType.NetworkError, "Network error", error_2);
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        HaxanFactory.prototype.send = function () {
            return this.execute();
        };
        HaxanFactory.prototype.execute = function () {
            return this.request();
        };
        HaxanFactory.prototype.request = function () {
            return __awaiter(this, void 0, void 0, function () {
                var res, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Promise.race([
                                    // Real request promise
                                    this.doRequest(),
                                    // Timeout promise
                                    timeout(this._opts.timeout),
                                ])];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, Ok(res)];
                        case 2:
                            error_3 = _a.sent();
                            return [2 /*return*/, Err(error_3)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return HaxanFactory;
    }());
    /**
     * Creates a new Haxan instance
     */
    function createHaxanFactory(url, _fetch) {
        return new HaxanFactory(url, _fetch);
    }

    var index = (function () {
        var f = createHaxanFactory;
        for (var key in types) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            f[key] = types[key];
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        f.HaxanFactory = HaxanFactory;
        return f;
    })();

    exports.HaxanError = HaxanError;
    exports.HaxanFactory = HaxanFactory;
    exports.default = index;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
