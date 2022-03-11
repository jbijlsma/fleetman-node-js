import React from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { updateSelectedDriver, restartRouteAsync } from "../store/index";
import { Vehicle } from "../models/Vehicle";

import "./Vehicles.css";

const Vehicles = ({}: React.PropsWithChildren<{}>) => {
  const dispatch = useAppDispatch();

  const vehicles = useAppSelector((state) => state.simulationReducer.vehicles);

  const driverSelectedHandler = (
    event: React.MouseEvent,
    driverName: string
  ) => {
    event.preventDefault();
    dispatch(updateSelectedDriver(driverName));
  };

  const restartedHandler = (event: React.MouseEvent, vehicle: Vehicle) => {
    event.preventDefault();
    dispatch(restartRouteAsync(vehicle));
  };

  const vehicleRows = vehicles.map((vehicle) => {
    const kmsLeft = vehicle.hasStopped ? (
      <button onClick={(event) => restartedHandler(event, vehicle)}>
        Restart
      </button>
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
