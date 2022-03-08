import React from "react";
import { Vehicle } from "../models/Vehicle";

import "./Vehicles.css";

const Vehicles = ({
  vehicles,
  driverSelected,
  restarted,
}: React.PropsWithChildren<{
  vehicles: Vehicle[];
  driverSelected: (drivername: string) => void;
  restarted: (vehicle: Vehicle) => void;
}>) => {
  const driverSelectedHandler = (
    event: React.MouseEvent,
    driverName: string
  ) => {
    event.preventDefault();
    driverSelected(driverName);
  };

  const vehicleRows = vehicles.map((vehicle) => {
    const kmsLeft = vehicle.hasStopped ? (
      <button onClick={() => restarted(vehicle)}>Restart</button>
    ) : (
      `${vehicle.kmsLeft.toFixed(1)} (${vehicle.totalDistance.toFixed(0)})`
    );

    return (
      <tr
        key={vehicle.driverName}
        style={{ cursor: "pointer" }}
        onClick={(event) => driverSelectedHandler(event, vehicle.driverName)}
      >
        <th scope="row">
          <span className="fa fa-truck"></span>
          {vehicle.driverName}
        </th>
        <td>{vehicle.speed}</td>
        <td>{kmsLeft}</td>
      </tr>
    );
  });

  return (
    <table className="table table-responsive table-hover table-condensed">
      <thead className=".thead-dark">
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Speed km/h</th>
          <th scope="col">KM left (total)</th>
        </tr>
      </thead>
      <tbody>{vehicleRows}</tbody>
    </table>
  );
};

export default Vehicles;
