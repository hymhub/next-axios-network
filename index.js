const Koa = require('koa');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });

app.use(bodyParser());

// 配置静态资源目录
const staticPath = path.join(__dirname, 'www');
app.use(serve(staticPath));

wss.on('connection', (socket) => {
  console.log('next-axios-network client connected');
});

// 处理HTTP请求
app.use(async (ctx) => {
  if (ctx.path === '/http-request' && ctx.method === 'POST') {
    const requestData = ctx.request.body;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // 将信息通过WebSocket推送给监控网页
        client.send(JSON.stringify(requestData));
      }
    });
    ctx.body = { status: 'success', message: 'HTTP Request received' };
  }
});

const PORT = process.env.PORT || 2999;

server.listen(PORT, () => {
  console.log(`next-axios-network listening on port ${PORT}`);
});
