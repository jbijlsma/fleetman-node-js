import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

import { useAppSelector } from "../store/hooks";

import redCarIcon from "../assets/car-red-32.png";
import blueCarIcon from "../assets/car-blue-32.png";
import greenCarIcon from "../assets/car-green-32.png";
import orangeCarIcon from "../assets/car-orange-32.png";

const carIcons = {
  red: redCarIcon,
  blue: blueCarIcon,
  green: greenCarIcon,
  orange: orangeCarIcon,
};

let numberOfPositionUpdatesSelectedVehicle = 0;

const tileLayer = {
  attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

const getMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: carIcons[color],
    iconSize: [32, 32],
  });
};

const VehicleMap = () => {
  const vehicles = useAppSelector((state) => state.simulationReducer.vehicles);
  const selectedDriverName = useAppSelector(
    (state) => state.simulationReducer.selectedDriverName
  );

  const center = [48.01278, 11.40562];
  const [map, setMap] = useState(null);

  const updateMap = (flyToPredicate) => {
    if (map && vehicles) {
      for (const vehicle of vehicles) {
        if (selectedDriverName === vehicle.driverName) {
          const lastPosition = vehicle.positions[vehicle.positions.length - 1];

          if (flyToPredicate()) {
            map.flyTo(lastPosition, map.getZoom(), {
              animate: false,
            });
          }

          numberOfPositionUpdatesSelectedVehicle++;
        }
      }
    }
  };

  useEffect(() => {
    updateMap(() => numberOfPositionUpdatesSelectedVehicle % 5 === 0);
  }, [vehicles]);

  useEffect(() => {
    updateMap(() => true);
  }, [selectedDriverName]);

  const polyLines = vehicles.map((vehicle) => {
    return (
      <Polyline
        key={vehicle.driverName}
        color={vehicle.color}
        opacity={0.5}
        weight={8}
        positions={vehicle.positions}
      ></Polyline>
    );
  });

  const markers = vehicles.map((vehicle) => {
    return (
      <Marker
        key={vehicle.driverName}
        icon={getMarkerIcon(vehicle.color)}
        position={vehicle.positions[vehicle.positions.length - 1]}
      >
        <Popup>{vehicle.name}</Popup>
      </Marker>
    );
  });

  return (
    <div id="map">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        whenCreated={setMap}
      >
        <TileLayer {...tileLayer} />

        {polyLines}

        {markers}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
