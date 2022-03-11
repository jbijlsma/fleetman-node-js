import { useEffect } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

import { useAppSelector, useAppDispatch } from "./store/hooks";
import {
  increaseSimulationSpeedAsync,
  decreaseSimulationSpeedAsync,
  updateVehicleAsync,
  VehicleUpdate,
} from "./store/index";

import Header from "./components/Header";
import Vehicles from "./components/Vehicles";

import VehicleMap from "./components/VehicleMap";

import "./App.css";

function App() {
  const simulationSpeed = useAppSelector(
    (state) => state.simulationReducer.simulationSpeed
  );
  const dispatch = useAppDispatch();

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
    client.onmessage = (msg) => {
      const vehicleUpdate = JSON.parse(msg.data as string) as VehicleUpdate;
      dispatch(updateVehicleAsync(vehicleUpdate));
    };
  }, []);

  return (
    <div className="page-wrap">
      <Header />
      <nav className="page-nav">
        <div className="simulation-speed">
          <span>Simulation speed: {simulationSpeed}x</span>
          <button
            onClick={() => {
              dispatch(increaseSimulationSpeedAsync());
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              dispatch(decreaseSimulationSpeedAsync());
            }}
          >
            -
          </button>
        </div>
      </nav>
      <main className="page-main">
        <VehicleMap />
      </main>
      <aside className="page-sidebar">
        <Vehicles />
      </aside>
    </div>
  );
}

export default App;
