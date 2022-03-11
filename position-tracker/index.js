(async () => {
  const { setIntervalAsync } = require("set-interval-async/dynamic");

  const express = require("express");
  const app = express();
  const PORT = 9001;

  const WebSocket = require("ws");
  const wss = new WebSocket.Server({ port: +process.argv[4] || 8080 });

  const DRIVER_QUEUE = "driver-queue";
  const DRIVER_POSITIONS_CHANNEL = "driver-position-updates-channel";

  const getDriverPositionsStorageKey = (driverName) => {
    return `${driverName}_driver-position-storage`;
  };

  const redis = require("redis");

  const redisClient = redis.createClient({
    url: "redis://redis-service:6379",
  });
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  setIntervalAsync(async () => {
    const msg = JSON.parse(await redisClient.lPop([DRIVER_QUEUE]));
    if (msg) {
      if (msg.type === "RouteStarted") {
        redisClient.del(getDriverPositionsStorageKey(msg.driverName));
      } else {
        redisClient.rPush(
          getDriverPositionsStorageKey(msg.data.driverName),
          JSON.stringify({
            tick: msg.data.tick,
            positions: [...msg.data.positions],
          })
        );

        await redisClient.publish(
          DRIVER_POSITIONS_CHANNEL,
          JSON.stringify(msg.data)
        );
      }
    }
  }, 500);

  const positionsChannelRedisClient = redisClient.duplicate();
  await positionsChannelRedisClient.connect();
  await positionsChannelRedisClient.subscribe(
    DRIVER_POSITIONS_CHANNEL,
    (message) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  );

  // /:driverName?untilTick=xx
  app.get("/:driverName", async (req, res) => {
    const driverName = req.params.driverName;
    const untilTick = req.query.untilTick ?? -1;
    const positions = await redisClient.lRange(
      getDriverPositionsStorageKey(driverName),
      0,
      -1
    );
    const positionsToSend = positions
      .slice(0, untilTick)
      .map((tickPositions) => JSON.parse(tickPositions).positions)
      .reduce((prev, cur) => prev.concat([...cur]), []);

    res.send(positionsToSend);
  });

  app.get("/", (req, res) => {
    res.send("Position-tracker is running");
  });

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
})();
