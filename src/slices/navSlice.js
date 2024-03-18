import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const GRAPH_HOPPER_API_KEY = '1f8e47e9-fcc5-4c26-8702-06e415fee0aa';

export const fetchTravelInfo = createAsyncThunk(
  'nav/fetchTravelInfo',
  async ({ origin, destination }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://graphhopper.com/api/1/route`, {
        params: {
          point: [`${origin.lat},${origin.lng}`, `${destination.lat},${destination.lng}`],
          vehicle: 'car',
          key: GRAPH_HOPPER_API_KEY,
        },
      });

      const distanceInMeters = response.data.paths[0].distance;
      const timeInSeconds = response.data.paths[0].time;

      return {
        distance: distanceInMeters / 1000, // Convert distance to kilometers
        duration: timeInSeconds / 3600, // Convert time to hours
      };
    } catch (error) {
      console.error('Error fetching travel info:', error);
      return rejectWithValue(error.response?.data || 'Unknown error');
    }
  }
);

export const navSlice = createSlice({
  name: 'nav',
  initialState: {
    origin: null,
    destination: null,
    selectedRideOption: null,
    travelTimeInformation: null,
    travelDistance: null,
    fetchStatus: 'idle',
    error: null,
    rideConfirmed: false,
    rideRequestId: null,  // Add a property to store the ride request ID
  },
  reducers: {
    setOrigin: (state, action) => {
      state.origin = action.payload;
    },
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    setSelectedRideOption: (state, action) => {
      state.selectedRideOption = action.payload;
    },
    setTravelTimeInformation: (state, action) => {
      state.travelTimeInformation = action.payload;
    },
    setTravelDistance: (state, action) => {
      state.travelDistance = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRideConfirmed: (state, action) => {
      state.rideConfirmed = action.payload;
    },
    setRideRequestId: (state, action) => {  // Add a reducer to set the ride request ID
      state.rideRequestId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTravelInfo.pending, (state) => {
        state.fetchStatus = 'loading';
      })
      .addCase(fetchTravelInfo.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.travelTimeInformation = action.payload;
      })
      .addCase(fetchTravelInfo.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setOrigin, 
  setDestination, 
  setSelectedRideOption, 
  setTravelTimeInformation, 
  setTravelDistance, 
  clearError, 
  setRideConfirmed,
  setRideRequestId  // Export the new action
} = navSlice.actions;

export const selectOrigin = (state) => state.nav.origin;
export const selectDestination = (state) => state.nav.destination;
export const selectSelectedRideOption = (state) => state.nav.selectedRideOption;
export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation;
export const selectTravelDistance = (state) => state.nav.travelDistance;
export const selectFetchStatus = (state) => state.nav.fetchStatus;
export const selectError = (state) => state.nav.error;
export const selectRideConfirmed = (state) => state.nav.rideConfirmed;
export const selectRideRequestId = (state) => state.nav.rideRequestId;  // Add a selector for the ride request ID

export default navSlice.reducer;
