import { useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

import Header from "./components/Header";
import Vehicles from "./components/Vehicles";

import VehicleMap from "./components/VehicleMap";

import "./App.css";
import { Vehicle } from "./models/Vehicle";

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriverName, setSelectedDriverName] = useState<string | null>(
    null
  );

  const updateVehicle = (
    prev: Vehicle[],
    vehicleUpdate: Vehicle,
    replacePositions: boolean
  ): Vehicle[] => {
    const updatedVehicles = prev.map(
      (v) =>
        new Vehicle(
          v.driverName,
          v.speed,
          v.totalDistance,
          v.kmsLeft,
          v.hasStopped,
          v.color,
          [...v.positions]
        )
    );

    const vehicle = updatedVehicles.find(
      (v) => v.driverName === vehicleUpdate.driverName
    );
    if (vehicle) {
      vehicle.speed = vehicleUpdate.speed;
      vehicle.kmsLeft = vehicleUpdate.kmsLeft;
      vehicle.hasStopped = vehicleUpdate.hasStopped;
      vehicle.positions = replacePositions
        ? vehicleUpdate.positions
        : vehicle.positions.concat(vehicleUpdate.positions);
    } else {
      updatedVehicles.push(
        new Vehicle(
          vehicleUpdate.driverName,
          vehicleUpdate.speed,
          vehicleUpdate.totalDistance,
          vehicleUpdate.kmsLeft,
          vehicleUpdate.hasStopped,
          vehicleUpdate.color,
          vehicleUpdate.positions
        )
      );
    }

    return updatedVehicles;
  };

  useEffect(() => {
    const uuid = (Math.random() + 1).toString(36).substring(7);
    // const url = window.location.origin.replace("https", "wss");
    // const wssUrl = `${url}/ws?uuid=${uuid}`;
    const wssUrl = `wss://fleetman-node.dotnet-works.com/ws?uuid=${uuid}`;
    console.log(wssUrl);
    const client = new W3CWebSocket(wssUrl);
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      const vehicleUpdate = JSON.parse(message.data as string);

      setSelectedDriverName((prev) => (prev ? prev : vehicleUpdate.driverName));

      setVehicles((prev) => {
        return updateVehicle(prev, vehicleUpdate, false);
      });
    };
  }, []);

  const restartedHandler = async (vehicle: Vehicle) => {
    const lastPosition = vehicle.positions[vehicle.positions.length - 1];
    const vehicleUpdate = { ...vehicle, positions: [lastPosition] };
    setVehicles((prev) => {
      return updateVehicle(prev, vehicleUpdate, true);
    });

    await fetch(
      `https://fleetman-node.dotnet-works.com/api/vehicles/${vehicle.driverName}/restart?origin=${lastPosition[0]},${lastPosition[1]}`
    );
  };

  return (
    <div className="page-wrap">
      <Header />
      <main className="page-main">
        <VehicleMap
          selectedDriverName={selectedDriverName}
          vehicles={vehicles}
        />
      </main>
      <aside className="page-sidebar">
        <Vehicles
          vehicles={vehicles}
          restarted={restartedHandler}
          driverSelected={(driverName: string) => {
            setSelectedDriverName(driverName);
          }}
        />
      </aside>
    </div>
  );
}

export default App;
