const Koa = require('koa');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const parseHeaders = require('parse-headers');

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });

const caches = []

app.use(bodyParser());

// 配置静态资源目录
const staticPath = path.join(__dirname, 'www');
app.use(serve(staticPath));

wss.on('connection', (socket) => {
  console.log('next-axios-network client connected');
});

const notify = (ctx, data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
  ctx.body = { status: 'success', message: 'next-axios-network Request received' };
}

// 处理HTTP请求
app.use(async (ctx) => {
  if (ctx.method === 'GET' && ctx.path === '/xxx') {
    console.log('in');
    ctx.body = 'ok';
  }
  if (ctx.method === 'GET' && ctx.path === '/caches') {
    ctx.body = caches;
  }
  if (ctx.method === 'POST') {
    const data = ctx.request.body;
    if (ctx.path === '/request-middle-ware') {
      if (caches.length > 50) {
        caches.shift()
      }
      const item = {
        id: data.id,
        type: 'equest-middle-ware',
        content: {
          request: {
            url: data.url,
            baseURL: data.baseURL,
            method: data.method.toUpperCase()
          }
        }
      }
      caches.push(item)
      notify(ctx, item)
    } else if (ctx.path === '/request-error') {
      notify(ctx, {
        type: 'request-error',
        data: data
      })
    } else if (ctx.path === '/response-middle-ware') {
      const item = caches.find(v => v.id === data.config.id)
      if (item) {
        item.content = {
          request: {
            ...item.content.request,
            headers: data.requestHeader ? parseHeaders(data.requestHeader.slice(data.requestHeader.indexOf('\n'))) : null
          },
          response: {
            status: data.status,
            statusText: data.statusText,
            headers: data.headers,
            config: data.config,
            data: data.data,
            timeConsuming: data.timeConsuming
          }
        }
      }
      notify(ctx, item)
    } else if (ctx.path === '/response-error') {
      notify(ctx, {
        type: 'response-error',
        data: data
      })
    }
  }
});

const PORT = process.env.PORT || 2999;

server.listen(PORT, () => {
  console.log(`next-axios-network listening on port ${PORT}`);
});
