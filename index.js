"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var next_axios_network_exports = {};
__export(next_axios_network_exports, {
  default: () => next_axios_network_default,
  middlewares: () => middlewares
});
module.exports = __toCommonJS(next_axios_network_exports);
var circularReplacer = () => {
  const seen = /* @__PURE__ */ new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};
var get_header = (obj, visited = /* @__PURE__ */ new WeakSet()) => {
  var _a, _b;
  const res1 = obj == null ? void 0 : obj._header;
  const res2 = (_a = obj == null ? void 0 : obj._currentRequest) == null ? void 0 : _a._header;
  const res3 = (_b = obj == null ? void 0 : obj._currentRequest) == null ? void 0 : _b._pendingData;
  if (res1 || res2 || res3) {
    return res1 || res2 || res3;
  }
  if (visited.has(obj)) {
    return null;
  }
  visited.add(obj);
  for (const key in obj) {
    if (key === "_header") {
      return obj[key];
    }
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const res = get_header(obj[key], visited);
      if (res) {
        return res;
      }
    }
  }
};
var tmpId = 0;
function serializable(data) {
  try {
    const res = JSON.stringify(data, circularReplacer());
    return res;
  } catch (error) {
    return false;
  }
}
var httpLogRequest = (data, type) => {
  const jsonData = serializable(data);
  typeof window === "undefined" && jsonData && fetch(`http://127.0.0.1:2999/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: jsonData
  }).then((response) => {
    if (!response.ok) {
      throw new Error();
    }
    return response.json();
  }).then((data2) => {
  }).catch((error) => {
    console.error(`next-axios-network ${type} send error:`, error);
  });
};
var middlewares = {
  requestMiddleWare(config) {
    if (process.env.NODE_ENV !== "development") {
      return config;
    }
    config.id = tmpId++ + Math.random();
    config.sendTime = Date.now();
    httpLogRequest(config, "request-middle-ware");
    return config;
  },
  requestError(error) {
    if (process.env.NODE_ENV !== "development") {
      return Promise.reject(error);
    }
    httpLogRequest(error, "request-error");
    return Promise.reject(error);
  },
  responseMiddleWare(response) {
    var _a;
    if (process.env.NODE_ENV !== "development") {
      return response;
    }
    httpLogRequest(
      {
        status: response == null ? void 0 : response.status,
        statusText: response == null ? void 0 : response.statusText,
        headers: (_a = response == null ? void 0 : response.headers) != null ? _a : {},
        config: response.config,
        data: response == null ? void 0 : response.data,
        requestHeader: get_header(response.request) || void 0,
        timeConsuming: Date.now() - response.config.sendTime
      },
      "response-middle-ware"
    );
    return response;
  },
  responseError(error) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (process.env.NODE_ENV !== "development") {
      return Promise.reject(error);
    }
    const sendTime = ((_a = error.config) == null ? void 0 : _a.sendTime) || ((_c = (_b = error.response) == null ? void 0 : _b.config) == null ? void 0 : _c.sendTime);
    httpLogRequest(
      {
        message: error.message,
        name: error.name,
        stack: error.stack,
        config: error.config || ((_d = error.response) == null ? void 0 : _d.config),
        code: error.code,
        status: (_e = error.response) == null ? void 0 : _e.status,
        statusText: (_f = error.response) == null ? void 0 : _f.statusText,
        requestHeader: (error == null ? void 0 : error.request) && get_header(error.request) || null,
        headers: (_g = error.response) == null ? void 0 : _g.headers,
        data: (_h = error.response) == null ? void 0 : _h.data,
        timeConsuming: sendTime && Date.now() - sendTime
      },
      "response-error"
    );
    return Promise.reject(error);
  }
};
var nextAxiosNetwork = (axios) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  globalThis.nextAxiosNetworkReqInterceptors && axios.interceptors.request.eject(
    globalThis.nextAxiosNetworkReqInterceptors
  );
  globalThis.nextAxiosNetworkResInterceptors && axios.interceptors.request.eject(
    globalThis.nextAxiosNetworkResInterceptors
  );
  globalThis.nextAxiosNetworkReqInterceptors = axios.interceptors.request.use(
    middlewares.requestMiddleWare,
    middlewares.requestError
  );
  globalThis.nextAxiosNetworkResInterceptors = axios.interceptors.response.use(
    middlewares.responseMiddleWare,
    middlewares.responseError
  );
};
var next_axios_network_default = nextAxiosNetwork;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  middlewares
});
