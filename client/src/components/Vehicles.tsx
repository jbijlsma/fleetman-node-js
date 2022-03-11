import React from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { updateSelectedDriver, restartRouteAsync } from "../store/index";
import { Vehicle } from "../models/Vehicle";

import classes from "./Vehicles.module.css";

const Vehicles = ({}: React.PropsWithChildren<{}>) => {
  const dispatch = useAppDispatch();

  const vehicles = useAppSelector((state) => state.simulationReducer.vehicles);
  const selectedDriverName = useAppSelector(
    (state) => state.simulationReducer.selectedDriverName
  );

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

    const trClasses = [classes.vehicleRow];
    if (vehicle.driverName === selectedDriverName) {
      trClasses.push(classes.vehicleSelected);
    }

    return (
      <tr
        key={vehicle.driverName}
        onClick={(event) => driverSelectedHandler(event, vehicle.driverName)}
        className={trClasses.join(" ")}
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

  const tableClasses = [
    "table",
    "table-responsive",
    "table-hover",
    "table-condensed",
    classes.vehicles,
  ];

  return (
    <table className={tableClasses.join(" ")}>
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
