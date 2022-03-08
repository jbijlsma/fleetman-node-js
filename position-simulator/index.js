(async () => {
  const express = require("express");
  const axios = require("axios");
  const {
    setIntervalAsync,
    clearIntervalAsync,
  } = require("set-interval-async/dynamic");

  const { decode } = require("@googlemaps/polyline-codec");

  const app = express();

  const PORT = 9002;

  const driverColors = { jfb: "blue", ybw: "red" };
  const driverSpeeds = { jfb: 50, ybw: 100 };
  let SPEEDUP_FACTOR = 20;

  const redis = require("redis");

  const POSITIONS_CHANNEL = "ws:vehicle-positions";
  const publisher = redis.createClient({ url: "redis://redis-service:6379" });
  await publisher.connect();

  const getDistanceInKm = (from, to) => {
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = (from[1] * Math.PI) / 180;
    lon2 = (to[1] * Math.PI) / 180;
    lat1 = (from[0] * Math.PI) / 180;
    lat2 = (to[0] * Math.PI) / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return c * r;
  };

  const getHourlySpeed = (secondsTravelled, distanceTravelled) => {
    return Math.round((distanceTravelled / secondsTravelled) * 60 * 60, 1);
  };

  const startSendingTestVehicleUpdates = (driverName, reverse) => {
    const color = driverColors[driverName];
    const speedInKmH = driverSpeeds[driverName];
    const allPoints = require(`./data/${driverName}_route.json`);
    const totalNumberOfPoints = allPoints.length;
    let startPoint = allPoints[0];
    let endPoint = allPoints[totalNumberOfPoints - 1];
    const totalDistance = getDistanceInKm(startPoint, endPoint);
    const distanceTravelledInOneSecond = speedInKmH / 3600;
    const distanceTravelledInOneTick =
      distanceTravelledInOneSecond * SPEEDUP_FACTOR;
    const numberOfPointsToSendPerTick = Math.ceil(
      (distanceTravelledInOneTick / totalDistance) * totalNumberOfPoints
    );
    const reverseFlag = reverse ? -1 : 1;

    let tick = 0;
    const interval = setIntervalAsync(async () => {
      const start = Math.min(
        totalNumberOfPoints - 1,
        Math.max(0, tick * numberOfPointsToSendPerTick * reverseFlag)
      );
      const end = Math.min(
        totalNumberOfPoints - 1,
        Math.max(start + numberOfPointsToSendPerTick * reverseFlag, 0)
      );

      const pointsToSend = allPoints.slice(start, end);

      const lastPointSent = end === 0 || end === totalNumberOfPoints - 1;

      const msg = JSON.stringify({
        driverName: driverName,
        color: color,
        speed: speedInKmH,
        positions: pointsToSend,
        numberOfPointsToSendPerTick: numberOfPointsToSendPerTick,
        start: start,
        end: end,
        hasStopped: lastPointSent,
      });

      await publisher.publish(POSITIONS_CHANNEL, msg);

      if (lastPointSent) {
        console.log("Ending timer");
        clearIntervalAsync(interval);
      }

      tick++;
    }, 1000);
  };

  // ?origin=lat.xx,long.xx&destination=lat.xx,long.xx
  app.get("/route/create", async (req, res) => {
    const apiKey = "xxx";
    const origin = req.query.origin;
    const destination = req.query.destination;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&sensor=false&mode=driving&alternatives=false&key=${apiKey}`;

    const response = await axios.get(url);
    const encodedPolyline = response.data.routes[0].overview_polyline.points;
    const decodedPolyline = decode(encodedPolyline, 5);

    res.send(decodedPolyline);
  });

  app.get("/vehicles/:name", async (req, res) => {
    const name = req.params.name;
    const routeData = require(`./data/${name}_route.json`);
    res.send(routeData);
  });

  app.get("/vehicles/:name/restart", async (req, res) => {
    const name = req.params.name;
    startSendingTestVehicleUpdates(name, false);
    res.send();
  });

  app.get("/", (req, res) => {
    res.send("Position-simulator is running");
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
    startSendingTestVehicleUpdates("jfb", false);
    startSendingTestVehicleUpdates("ybw", false);
  });
})();
