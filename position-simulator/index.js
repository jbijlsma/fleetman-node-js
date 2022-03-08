(async () => {
  const express = require("express");
  const axios = require("axios");
  const { setIntervalAsync } = require("set-interval-async/dynamic");

  const { decode } = require("@googlemaps/polyline-codec");

  const app = express();
  const PORT = 9002;

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

  const startSendingTestVehicleUpdates = (
    driverName,
    color,
    updateIntervalInMs
  ) => {
    const routePoints = require(`./data/${driverName}_route.json`);
    const numberOfRoutePoints = routePoints.length;
    let startPoint = routePoints[0];
    let endPoint = routePoints[numberOfRoutePoints - 1];

    console.log("startSendingTestVehicleUpdates");

    let currentRoutePoint = 0;
    let step = 1;
    let secondsTravelled = 0;

    setIntervalAsync(async () => {
      const currentPosition = routePoints[currentRoutePoint];
      const distanceTravelled = getDistanceInKm(startPoint, currentPosition);
      const speedInKm = getHourlySpeed(secondsTravelled, distanceTravelled);
      const distanceToEndpoint = getDistanceInKm(currentPosition, endPoint);

      const msg = JSON.stringify({
        driverName: driverName,
        color: color,
        speed: speedInKm,
        distanceToEndpoint: distanceToEndpoint,
        position: currentPosition,
        currentRoutePoint: currentRoutePoint,
      });

      await publisher.publish(POSITIONS_CHANNEL, msg);

      currentRoutePoint = currentRoutePoint + step;
      secondsTravelled++;

      if (currentRoutePoint >= numberOfRoutePoints - 1) {
        step = -1;
        startPoint = routePoints[numberOfRoutePoints - 1];
        endPoint = routePoints[0];
        secondsTravelled = 0;
      }
      if (currentRoutePoint <= 0) {
        step = 1;
        startPoint = routePoints[0];
        endPoint = routePoints[numberOfRoutePoints - 1];
        secondsTravelled = 0;
      }
    }, updateIntervalInMs);
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

  app.get("/", (req, res) => {
    res.send("Position-simulator is running");
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
    startSendingTestVehicleUpdates("jfb", "blue", 500);
    startSendingTestVehicleUpdates("ybw", "red", 100);
  });
})();
