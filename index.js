const circularReplacer = () => {
    const seen = new WeakSet();
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
const get_header = (obj, visited = new WeakSet()) => {
    var _a, _b;
    const res1 = obj === null || obj === void 0 ? void 0 : obj._header;
    const res2 = (_a = obj === null || obj === void 0 ? void 0 : obj._currentRequest) === null || _a === void 0 ? void 0 : _a._header;
    const res3 = (_b = obj === null || obj === void 0 ? void 0 : obj._currentRequest) === null || _b === void 0 ? void 0 : _b._pendingData;
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
function serializable(data) {
    try {
        const res = JSON.stringify(data, circularReplacer());
        return res;
    }
    catch (error) {
        return false;
    }
}
const httpLogRequest = (data, type) => {
    const jsonData = serializable(data);
    typeof window === "undefined" &&
        jsonData &&
        fetch(`http://127.0.0.1:2999/${type}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: jsonData,
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        })
            .then((data) => { })
            .catch((error) => {
            console.error(`next-axios-network ${type} send error:`, error);
        });
};
export const middlewares = {
    requestMiddleWare(config) {
        if (process.env.NODE_ENV !== "development") {
            return config;
        }
        config.id = Math.random();
        config.sendTime = Date.now();
        httpLogRequest(config, "request-middle-ware");
        return config;
    },
    requestError(error) {
        if (process.env.NODE_ENV !== "development") {
            return error;
        }
        httpLogRequest(error, "request-error");
        return Promise.reject(error);
    },
    responseMiddleWare(response) {
        if (process.env.NODE_ENV !== "development") {
            return response;
        }
        httpLogRequest({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            config: response.config,
            data: response.data,
            requestHeader: get_header(response.request) || null,
            timeConsuming: Date.now() - response.config.sendTime,
        }, "response-middle-ware");
        return response;
    },
    responseError(error) {
        var _a, _b, _c, _d, _e, _f;
        if (process.env.NODE_ENV !== "development") {
            return error;
        }
        const sendTime = ((_a = error.config) === null || _a === void 0 ? void 0 : _a.sendTime) || ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.config) === null || _c === void 0 ? void 0 : _c.sendTime);
        httpLogRequest({
            message: error.message,
            name: error.name,
            stack: error.stack,
            config: error.config || ((_d = error.response) === null || _d === void 0 ? void 0 : _d.config),
            code: error.code,
            status: error.response.status,
            statusText: error.response.statusText,
            requestHeader: ((error === null || error === void 0 ? void 0 : error.request) && get_header(error.request)) || null,
            headers: (_e = error.response) === null || _e === void 0 ? void 0 : _e.headers,
            data: (_f = error.response) === null || _f === void 0 ? void 0 : _f.data,
            timeConsuming: sendTime && Date.now() - sendTime,
        }, "response-error");
        return Promise.reject(error);
    },
};
const nextAxiosNetwork = (axios) => {
    if (process.env.NODE_ENV !== "development") {
        return;
    }
    globalThis.nextAxiosNetworkReqInterceptors &&
        axios.interceptors.request.eject(globalThis.nextAxiosNetworkReqInterceptors);
    globalThis.nextAxiosNetworkResInterceptors &&
        axios.interceptors.request.eject(globalThis.nextAxiosNetworkResInterceptors);
    globalThis.nextAxiosNetworkReqInterceptors = axios.interceptors.request.use(middlewares.requestMiddleWare, middlewares.requestError);
    globalThis.nextAxiosNetworkResInterceptors = axios.interceptors.response.use(middlewares.responseMiddleWare, middlewares.responseError);
};
export default nextAxiosNetwork;
