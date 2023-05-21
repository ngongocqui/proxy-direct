const http = require("http");
const httpProxy = require("http-proxy");
const yenv = require("yenv");
const _ = require("lodash");

const proxy = httpProxy.createProxyServer({});
const env = yenv("env.yaml", { env: process.env.NODE_ENV });

const isEqualHeader = (headerSource, headerTarget) => {
  const arraySource = Object.entries(headerSource).map(([key, value]) => ({
    key: String(key).trim().toLocaleLowerCase(),
    value: String(value).trim().toLocaleLowerCase(),
  }));
  const arrayTarget = Object.entries(headerTarget).map(([key, value]) => ({
    key: String(key).trim().toLocaleLowerCase(),
    value: String(value).trim().toLocaleLowerCase(),
  }));
  return _.differenceWith(arrayTarget, arraySource, _.isEqual)?.length === 0;
};

const server = http.createServer((req, res) => {
  const check = env.servers?.every?.((server) => {
    if (isEqualHeader(req.headers, server.headers)) {
      proxy.web(req, res, { target: server, changeOrigin: true });
      return false;
    }
    return true;
  });

  if (check) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(400);
    res.end(`{ "message": "Not found http direct!" }`);
  }
});

console.log(`listening on port ${env.PORT}`);
server.listen(env.PORT);
