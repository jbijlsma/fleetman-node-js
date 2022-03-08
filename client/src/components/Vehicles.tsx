import React from "react";
import { Vehicle } from "../models/Vehicle";

import "./Vehicles.css";

const Vehicles = ({
  vehicles,
  driverSelected,
}: React.PropsWithChildren<{
  vehicles: Vehicle[];
  driverSelected: (drivername: string) => void;
}>) => {
  const driverSelectedHandler = (
    event: React.MouseEvent,
    driverName: string
  ) => {
    event.preventDefault();
    driverSelected(driverName);
  };

  const vehicleRows = vehicles.map((vehicle) => {
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
        <td></td>
        <td>{vehicle.speed}</td>
      </tr>
    );
  });

  return (
    <table className="table table-responsive table-hover table-condensed">
      <thead className=".thead-dark">
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Last seen</th>
          <th scope="col">Speed km/h</th>
        </tr>
      </thead>
      <tbody>{vehicleRows}</tbody>
    </table>
  );
};

export default Vehicles;
