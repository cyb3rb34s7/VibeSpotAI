import http from "node:http";

const listenPort = Number(process.env.PHONE_API_PROXY_PORT || 39091);
const targetHost = process.env.PHONE_API_TARGET_HOST || "127.0.0.1";
const targetPort = Number(process.env.PHONE_API_TARGET_PORT || 38191);

const server = http.createServer((clientRequest, clientResponse) => {
  const proxyRequest = http.request(
    {
      headers: clientRequest.headers,
      hostname: targetHost,
      method: clientRequest.method,
      path: clientRequest.url,
      port: targetPort,
    },
    (proxyResponse) => {
      clientResponse.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(clientResponse);
    },
  );

  proxyRequest.on("error", (error) => {
    clientResponse.writeHead(502, { "Content-Type": "application/json" });
    clientResponse.end(
      JSON.stringify({
        error: "Phone API proxy could not reach FastAPI",
        message: error.message,
        target: `http://${targetHost}:${targetPort}`,
      }),
    );
  });

  clientRequest.pipe(proxyRequest);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(
    `Phone API proxy listening on http://0.0.0.0:${listenPort} -> http://${targetHost}:${targetPort}`,
  );
});
