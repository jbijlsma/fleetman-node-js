import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

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

const VehicleMap = (props) => {
  const center = [48.01278, 11.40562];
  const [map, setMap] = useState(null);

  const updateMap = (flyToPredicate) => {
    if (map && props.vehicles) {
      for (const vehicle of props.vehicles) {
        if (props.selectedDriverName === vehicle.driverName) {
          const lastPosition = vehicle.positions[vehicle.positions.length - 1];

          if (flyToPredicate()) {
            map.flyTo(lastPosition, map.getZoom(), {
              animate: false,
              duration: 1,
            });
          }

          numberOfPositionUpdatesSelectedVehicle++;
        }
      }
    }
  };

  useEffect(() => {
    updateMap(() => numberOfPositionUpdatesSelectedVehicle % 5 === 0);
  }, [props.vehicles]);

  useEffect(() => {
    updateMap(() => true);
  }, [props.selectedDriverName]);

  const polyLines = props.vehicles.map((vehicle) => {
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

  const markers = props.vehicles.map((vehicle) => {
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
