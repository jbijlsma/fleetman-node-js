(async () => {
  const express = require("express");

  const app = express();
  const PORT = 9001;

  const WebSocket = require("ws");
  const redis = require("redis");

  const subscriber = redis.createClient({ url: "redis://redis-service:6379" });

  await subscriber.connect();

  const POSITIONS_CHANNEL = "ws:vehicle-positions";

  const wss = new WebSocket.Server({ port: +process.argv[4] || 8080 });

  await subscriber.subscribe(POSITIONS_CHANNEL, (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  wss.on("connection", async (ws) => {
    ws.on("message", async (data) => {
      await publisher.publish(POSITIONS_CHANNEL, data);
    });
  });

  app.get("/", (req, res) => {
    res.send("Position-tracker is running");
  });

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
})();
