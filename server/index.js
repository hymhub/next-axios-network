const Koa = require("koa");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const path = require("path");
const parseHeaders = require("parse-headers");
var qs = require("qs");

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });

const caches = [];

app.use(bodyParser());

// 配置静态资源目录
const staticPath = path.join(__dirname, "www");
app.use(serve(staticPath));

wss.on("connection", (socket) => {
  console.log("next-axios-network client connected");
  socket.send(
    JSON.stringify({
      type: "init",
      caches,
    })
  );
});

const notify = (ctx, data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
  ctx.body = {
    status: "success",
    message: "next-axios-network Request received",
  };
};

// 设置 CORS 头
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  await next();
});

// 处理HTTP请求
app.use(async (ctx) => {
  if (ctx.method === "POST") {
    let data = ctx.request.body;
    if (typeof data === "string") {
      data = JSON.parse(data);
    }
    if (ctx.path === "/request-middle-ware") {
      if (caches.length > 50) {
        caches.pop();
      }
      const item = {
        id: data.id,
        content: {
          request: {
            ...data,
            url: data.url,
            baseURL: data.baseURL,
            fullURL:
              (data.baseURL ?? "") +
              (!data.baseURL || data.baseURL.endsWith("/") ? "" : "/") +
              (data.url[0] === "/" ? data.url.slice(1) : data.url) +
              (data.params ? `?${qs.stringify(data.params)}` : ""),
            method: data.method.toUpperCase(),
            headers:
              data.headers &&
              Object.values(data.headers).find(
                (v) => v.toString() === "[object Object]"
              )
                ? undefined
                : data.headers,
          },
        },
      };
      caches.unshift(item);
      notify(ctx, {
        ...item,
        type: "request-middle-ware",
      });
    } else if (ctx.path === "/request-error") {
      notify(ctx, {
        type: "request-error",
        data: data,
      });
    } else if (ctx.path === "/response-middle-ware") {
      const item = caches.find((v) => v.id === data.config.id);
      if (item) {
        item.content = {
          request: {
            ...item.content.request,
            headers: data.requestHeader
              ? parseHeaders(
                  data.requestHeader.slice(data.requestHeader.indexOf("\n"))
                )
              : null,
          },
          response: {
            status: data.status,
            statusText: data.statusText,
            headers: data.headers,
            config: data.config,
            data: data.data,
            timeConsuming: data.timeConsuming,
          },
        };
      }
      notify(ctx, {
        ...item,
        type: "response-middle-ware",
      });
    } else if (ctx.path === "/response-error") {
      const item = caches.find((v) => v.id === data.config.id);
      if (item) {
        item.content = {
          request: {
            ...item.content.request,
            headers: data.requestHeader
              ? parseHeaders(
                  data.requestHeader.slice(data.requestHeader.indexOf("\n"))
                )
              : null,
          },
          response: {
            status: data.status,
            statusText: data.statusText,
            headers: data.headers,
            config: data.config,
            data: data.data,
            timeConsuming: data.timeConsuming,
          },
        };
      }
      notify(ctx, {
        ...item,
        type: "response-error"
      });
    }
  }
});

const PORT = process.env.PORT || 2999;

server.listen(PORT, () => {
  console.log(`next-axios-network listening on port ${PORT}`);
});
