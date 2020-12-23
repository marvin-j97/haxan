"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Haxan = {}));
})(void 0, function (exports) {
  'use strict';

  var VERSION = "0.2.0";

  var __extends = undefined && undefined.__extends || function () {
    var _extendStatics = function extendStatics(d, b) {
      _extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (d, b) {
        d.__proto__ = b;
      } || function (d, b) {
        for (var p in b) {
          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        }
      };

      return _extendStatics(d, b);
    };

    return function (d, b) {
      _extendStatics(d, b);

      function __() {
        this.constructor = d;
      }

      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  /**
   * Thrown on internal errors
   */


  var HaxanError =
  /** @class */
  function (_super) {
    __extends(HaxanError, _super);

    function HaxanError() {
      var _this = _super !== null && _super.apply(this, arguments) || this;

      _this.isHaxanError = true;
      return _this;
    }

    return HaxanError;
  }(Error);

  function isHaxanError(val) {
    return val && val.isHaxanError === true;
  }
  /**
   * Thrown when the timeout limit is reached
   */


  var HaxanTimeout =
  /** @class */
  function (_super) {
    __extends(HaxanTimeout, _super);

    function HaxanTimeout() {
      var _this = _super.call(this) || this;

      _this.isTimeout = true;
      return _this;
    }

    return HaxanTimeout;
  }(HaxanError);

  function isHaxanTimeout(val) {
    return isHaxanError(val) && val.isTimeout === true;
  }
  /**
   * Thrown when the custom rejectOn function evaluates to true
   */


  var HaxanRejection =
  /** @class */
  function (_super) {
    __extends(HaxanRejection, _super);

    function HaxanRejection(res) {
      var _this = _super.call(this) || this;

      _this.isRejection = true;
      _this.response = res;
      return _this;
    }

    return HaxanRejection;
  }(HaxanError);

  function isHaxanRejection(val) {
    return isHaxanError(val) && val.isRejection === true;
  }
  /**
   * Thrown when the request is aborted
   */


  var HaxanAbort =
  /** @class */
  function (_super) {
    __extends(HaxanAbort, _super);

    function HaxanAbort() {
      var _this = _super.call(this) || this;

      _this.isAbort = true;
      return _this;
    }

    return HaxanAbort;
  }(HaxanError);

  function isHaxanAbort(val) {
    return isHaxanError(val) && val.isAbort === true;
  }
  /**
   * Response modes, defaults to auto.
   *
   * Auto parses to JSON when the Content-Type header is set to `application/json`
   * Otherwise the response body is returned as string
   *
   * Stream is only usable in Node.js
   */


  var ResponseType;

  (function (ResponseType) {
    ResponseType["Auto"] = "auto";
    ResponseType["Json"] = "json";
    ResponseType["Text"] = "text";
    ResponseType["Stream"] = "stream";
  })(ResponseType || (ResponseType = {}));
  /**
   * HTTP methods
   */


  var HTTPMethod;

  (function (HTTPMethod) {
    HTTPMethod["Get"] = "GET";
    HTTPMethod["Post"] = "POST";
    HTTPMethod["Put"] = "PUT";
    HTTPMethod["Patch"] = "PATCH";
    HTTPMethod["Delete"] = "DELETE";
    HTTPMethod["Head"] = "HEAD";
    HTTPMethod["Options"] = "OPTIONS";
  })(HTTPMethod || (HTTPMethod = {}));

  var types = /*#__PURE__*/Object.freeze({
    __proto__: null,
    HaxanError: HaxanError,
    isHaxanError: isHaxanError,
    HaxanTimeout: HaxanTimeout,
    isHaxanTimeout: isHaxanTimeout,
    HaxanRejection: HaxanRejection,
    isHaxanRejection: isHaxanRejection,
    HaxanAbort: HaxanAbort,
    isHaxanAbort: isHaxanAbort,

    get ResponseType() {
      return ResponseType;
    },

    get HTTPMethod() {
      return HTTPMethod;
    }

  });

  function isBrowser() {
    return typeof window !== "undefined" && {}.toString.call(window) === "[object Window]";
  }

  function stringifyQuery(params) {
    return Object.keys(params).map(function (key) {
      return key + "=" + String(params[key]);
    }).join("&");
  }

  function normalizeHeaders(headers) {
    var normalized = {};
    headers.forEach(function (v, k) {
      normalized[k] = v;
    });
    return normalized;
  }

  function canHaveBody(method) {
    return [HTTPMethod.Put, HTTPMethod.Post, HTTPMethod.Patch].includes(method.toUpperCase());
  }

  var __assign = undefined && undefined.__assign || function () {
    __assign = Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

  var __generator = undefined && undefined.__generator || function (thisArg, body) {
    var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
        f,
        y,
        t,
        g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
      return this;
    }), g;

    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }

    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");

      while (_) {
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];

          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;

            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };

            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;

            case 7:
              op = _.ops.pop();

              _.trys.pop();

              continue;

            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }

              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }

              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }

              if (t && _.label < t[2]) {
                _.label = t[2];

                _.ops.push(op);

                break;
              }

              if (t[2]) _.ops.pop();

              _.trys.pop();

              continue;
          }

          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      }

      if (op[0] & 5) throw op[1];
      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  };
  /**
   * Request factory, supports both options (given in constructor)
   * and a chainable API
   */


  var HaxanFactory =
  /** @class */
  function () {
    function HaxanFactory(url, opts) {
      this._opts = {
        url: "",
        headers: {},
        query: {},
        method: HTTPMethod.Get,
        body: undefined,
        type: ResponseType.Auto,
        rejectOn: function rejectOn() {
          return false;
        },
        abortSignal: undefined,
        timeout: 30000
      };

      if (opts) {
        Object.assign(this._opts, opts);
      }

      this.url(url);
    }

    HaxanFactory.prototype.setProp = function (key, value) {
      this._opts[key] = value;
      return this;
    };

    HaxanFactory.prototype.rejectOn = function (func) {
      return this.setProp("rejectOn", func);
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
      return this.method("GET");
    };

    HaxanFactory.prototype.head = function () {
      return this.method("HEAD");
    };

    HaxanFactory.prototype.options = function () {
      return this.method("OPTIONS");
    };

    HaxanFactory.prototype.post = function (body) {
      return this.body(body).method("POST");
    };

    HaxanFactory.prototype.put = function (body) {
      return this.body(body).method("PUT");
    };

    HaxanFactory.prototype.patch = function (body) {
      return this.body(body).method("PATCH");
    };

    HaxanFactory.prototype["delete"] = function () {
      return this.method("DELETE");
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

      return JSON.stringify(body);
    };

    HaxanFactory.prototype.parseBody = function (res) {
      return __awaiter(this, void 0, void 0, function () {
        var contentType;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              contentType = res.headers.get("content-type");
              if (!(contentType && contentType.startsWith("application/json"))) return [3
              /*break*/
              , 2];
              return [4
              /*yield*/
              , res.json()];

            case 1:
              return [2
              /*return*/
              , _a.sent()];

            case 2:
              return [4
              /*yield*/
              , res.text()];

            case 3:
              return [2
              /*return*/
              , _a.sent()];
          }
        });
      });
    };

    HaxanFactory.prototype.getOptions = function () {
      return this._opts;
    };

    HaxanFactory.prototype.send = function () {
      return this.execute();
    };

    HaxanFactory.prototype.execute = function () {
      return this.request();
    };

    HaxanFactory.prototype.request = function () {
      return __awaiter(this, void 0, void 0, function () {
        var fetchImplementation, _isBrowser, url, res, resHeaders, error_1;

        var _a, _b, _c;

        var _this = this;

        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              _d.trys.push([0, 9,, 10]);

              fetchImplementation = void 0;
              _isBrowser = isBrowser();

              if (_isBrowser) {
                fetchImplementation = fetch;
              } else {
                fetchImplementation = require("node-fetch");
              }

              url = Object.keys(this._opts.query).length ? this._opts.url + "?" + stringifyQuery(this._opts.query) : this._opts.url;
              return [4
              /*yield*/
              , Promise.race([fetchImplementation(url, {
                method: this._opts.method,
                headers: __assign(__assign({
                  "Content-Type": "application/json"
                }, this._opts.headers), {
                  "User-Agent": "Haxan " + VERSION
                }),
                body: canHaveBody(this._opts.method) ? this.normalizedBody() : undefined,
                signal: this._opts.abortSignal
              }), new Promise(function (_, reject) {
                return setTimeout(function () {
                  return reject(new HaxanTimeout());
                }, _this._opts.timeout);
              })])];

            case 1:
              res = _d.sent();

              if (this._opts.rejectOn(res.status)) {
                throw new HaxanRejection(res);
              }

              resHeaders = normalizeHeaders(res.headers);
              if (!(this._opts.type === ResponseType.Auto)) return [3
              /*break*/
              , 3];
              _a = {};
              return [4
              /*yield*/
              , this.parseBody(res)];

            case 2:
              return [2
              /*return*/
              , (_a.data = _d.sent(), _a.ok = res.ok, _a.status = res.status, _a.headers = resHeaders, _a)];

            case 3:
              if (!(this._opts.type === ResponseType.Json)) return [3
              /*break*/
              , 5];
              _b = {};
              return [4
              /*yield*/
              , res.json()];

            case 4:
              return [2
              /*return*/
              , (_b.data = _d.sent(), _b.ok = res.ok, _b.status = res.status, _b.headers = resHeaders, _b)];

            case 5:
              if (!(this._opts.type === ResponseType.Text)) return [3
              /*break*/
              , 7];
              _c = {};
              return [4
              /*yield*/
              , res.text()];

            case 6:
              return [2
              /*return*/
              , (_c.data = _d.sent(), _c.ok = res.ok, _c.status = res.status, _c.headers = resHeaders, _c)];

            case 7:
              if (this._opts.type === ResponseType.Stream && !_isBrowser) {
                return [2
                /*return*/
                , {
                  data: res.body,
                  ok: res.ok,
                  status: res.status,
                  headers: resHeaders
                }];
              }

              _d.label = 8;

            case 8:
              throw new Error("No valid response body parsing method found");

            case 9:
              error_1 = _d.sent();

              if (error_1.name === "AbortError") {
                throw new HaxanAbort();
              }

              throw error_1;

            case 10:
              return [2
              /*return*/
              ];
          }
        });
      });
    };

    return HaxanFactory;
  }();
  /**
   * Creates a new Haxan instance
   */


  function createHaxanFactory(url, opts) {
    return new HaxanFactory(url, opts);
  }

  var index = function () {
    var f = createHaxanFactory;

    for (var key in types) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      f[key] = types[key];
    } // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore


    f.HaxanFactory = HaxanFactory;
    return f;
  }();

  exports.HaxanFactory = HaxanFactory;
  exports["default"] = index;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});
