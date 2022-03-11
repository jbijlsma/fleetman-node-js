import {
  configureStore,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { Vehicle } from "../models/Vehicle";

const allowedSpeeds: number[] = [1, 2, 5, 10, 20, 60];

export interface SimulationState {
  simulationSpeed: number;
  selectedDriverName: string | null;
  vehicles: Vehicle[];
}

export interface VehicleUpdate {
  driverName: string;
  tick: number;
  color: string;
  speed: number;
  totalDistance: number;
  kmsLeft: number;
  positions: number[][];
  hasStopped: boolean;
}

const initialState: SimulationState = {
  simulationSpeed: 20,
  selectedDriverName: null,
  vehicles: [],
};

export const getUserDetails = createAsyncThunk(
  "userDetails/getUserDetails",
  async (arg: void, { getState }) => {
    const state = getState();
    console.log(state);
  }
);

export const increaseSimulationSpeedAsync = createAsyncThunk(
  "simulation/speed/increase",
  async (_: void, { getState }) => {
    const currentSpeed = (getState() as any).simulationReducer.simulationSpeed;
    const speedIndex = allowedSpeeds.findIndex(
      (speed) => currentSpeed === speed
    );

    if (speedIndex < allowedSpeeds.length - 1) {
      const newSpeed = allowedSpeeds[speedIndex + 1];
      await fetch(
        `https://fleetman-node.dotnet-works.com/api/simulation/speed/${newSpeed}`,
        {
          method: "POST",
        }
      );
      return newSpeed;
    }

    return currentSpeed;
  }
);

export const decreaseSimulationSpeedAsync = createAsyncThunk(
  "simulation/speed/decrease",
  async (_: void, { getState }) => {
    const currentSpeed = (getState() as any).simulationReducer.simulationSpeed;
    const speedIndex = allowedSpeeds.findIndex(
      (speed) => currentSpeed === speed
    );

    if (speedIndex > 0) {
      const newSpeed = allowedSpeeds[speedIndex - 1];
      await fetch(`/api/simulation/speed/${newSpeed}`, {
        method: "POST",
      });
      return newSpeed;
    }

    return currentSpeed;
  }
);

export const restartRouteAsync = createAsyncThunk(
  "vehicle/restart",
  async (vehicle: Vehicle) => {
    const driverName = vehicle.driverName;
    const lastPosition = vehicle.positions[vehicle.positions.length - 1];
    await fetch(
      `/api/vehicles/${driverName}/restart?origin=${lastPosition[0]},${lastPosition[1]}`
    );

    return { driverName: driverName, lastPosition: lastPosition };
  }
);

export const updateVehicleAsync = createAsyncThunk(
  "vehicles/update",
  async (vehicleUpdate: VehicleUpdate, { getState }) => {
    const vehicles = (getState() as any).simulationReducer
      .vehicles as Vehicle[];
    if (
      vehicles.findIndex((v) => v.driverName === vehicleUpdate.driverName) < 0
    ) {
      const response = await fetch(
        `/position-tracker/${vehicleUpdate.driverName}?untilTick=${vehicleUpdate.tick}`
      );
      const allPositionsForCurrentRoute = await response.json();
      return {
        ...vehicleUpdate,
        positions: allPositionsForCurrentRoute.concat(vehicleUpdate.positions),
      };
    }

    return vehicleUpdate;
  }
);

export const simulationSlice = createSlice({
  name: "simulation",
  initialState,
  reducers: {
    increaseSimulationSpeed: (state) => {
      const speedIndex = allowedSpeeds.findIndex(
        (speed) => state.simulationSpeed === speed
      );
      if (speedIndex < allowedSpeeds.length - 1) {
        state.simulationSpeed = allowedSpeeds[speedIndex + 1];
      }
    },
    decreaseSimulationSpeed: (state) => {
      const speedIndex = allowedSpeeds.findIndex(
        (speed) => state.simulationSpeed === speed
      );
      if (speedIndex > 0) {
        state.simulationSpeed = allowedSpeeds[speedIndex - 1];
      }
    },
    updateSelectedDriver: (state, action: PayloadAction<string>) => {
      state.selectedDriverName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(increaseSimulationSpeedAsync.fulfilled, (state, action) => {
      state.simulationSpeed = action.payload;
    });
    builder.addCase(decreaseSimulationSpeedAsync.fulfilled, (state, action) => {
      state.simulationSpeed = action.payload;
    });
    builder.addCase(restartRouteAsync.fulfilled, (state, action) => {
      const { driverName, lastPosition } = action.payload;
      const vehicle = state.vehicles.find((v) => v.driverName === driverName);
      if (vehicle) {
        vehicle.positions = [lastPosition];
      }
    });
    builder.addCase(updateVehicleAsync.fulfilled, (state, action) => {
      const vehicleUpdate = action.payload;
      const vehicleIndex = state.vehicles.findIndex(
        (v) => v.driverName === vehicleUpdate.driverName
      );
      if (vehicleIndex < 0) {
        state.vehicles.push(vehicleUpdate as Vehicle);
        if (!state.selectedDriverName) {
          state.selectedDriverName = vehicleUpdate.driverName;
        }
      } else {
        state.vehicles[vehicleIndex] = {
          ...vehicleUpdate,
          positions: state.vehicles[vehicleIndex].positions.concat(
            vehicleUpdate.positions
          ),
        };
      }
    });
  },
});

export const {
  increaseSimulationSpeed,
  decreaseSimulationSpeed,
  updateSelectedDriver,
} = simulationSlice.actions;

export const store = configureStore({
  reducer: {
    simulationReducer: simulationSlice.reducer,
  },
});

export default simulationSlice.reducer;
