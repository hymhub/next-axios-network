const circularReplacer = () => {
  const seen = new WeakSet();
  return (key: any, value: object | null) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};
const get_header = (obj: any, visited = new WeakSet()) => {
  const res1 = obj?._header;
  const res2 = obj?._currentRequest?._header;
  const res3 = obj?._currentRequest?._pendingData;
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
      const res: any = get_header(obj[key], visited);
      if (res) {
        return res;
      }
    }
  }
};

function serializable(data: any) {
  try {
    const res = JSON.stringify(data, circularReplacer());
    return res;
  } catch (error) {
    return false;
  }
}

const httpLogRequest = (data: any, type: string) => {
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
      .then((data) => {})
      .catch((error) => {
        console.error(`next-axios-network ${type} send error:`, error);
      });
};
export const middlewares = {
  requestMiddleWare(config: any) {
    if (process.env.NODE_ENV !== "development") {
      return config;
    }
    config.id = Math.random();
    config.sendTime = Date.now();
    httpLogRequest(config, "request-middle-ware");
    return config;
  },
  requestError(error: any) {
    if (process.env.NODE_ENV !== "development") {
      return error;
    }
    httpLogRequest(error, "request-error");
    return Promise.reject(error);
  },
  responseMiddleWare(response: any) {
    if (process.env.NODE_ENV !== "development") {
      return response;
    }
    httpLogRequest(
      {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: response.config,
        data: response.data,
        requestHeader: get_header(response.request) || null,
        timeConsuming: Date.now() - response.config.sendTime,
      },
      "response-middle-ware"
    );
    return response;
  },
  responseError(error: any) {
    if (process.env.NODE_ENV !== "development") {
      return error;
    }
    const sendTime = error.config?.sendTime || error.response?.config?.sendTime;
    httpLogRequest(
      {
        message: error.message,
        name: error.name,
        stack: error.stack,
        config: error.config || error.response?.config,
        code: error.code,
        status: error.response.status,
        statusText: error.response.statusText,
        requestHeader: (error?.request && get_header(error.request)) || null,
        headers: error.response?.headers,
        data: error.response?.data,
        timeConsuming: sendTime && Date.now() - sendTime,
      },
      "response-error"
    );
    return Promise.reject(error);
  },
};

const nextAxiosNetwork = (axios: any) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  globalThis.nextAxiosNetworkReqInterceptors &&
    axios.interceptors.request.eject(
      globalThis.nextAxiosNetworkReqInterceptors
    );
  globalThis.nextAxiosNetworkResInterceptors &&
    axios.interceptors.request.eject(
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

export default nextAxiosNetwork;
