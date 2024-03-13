import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Replace 'YOUR_GRAPH_HOPPER_API_KEY' with your actual GraphHopper API key.
const GRAPH_HOPPER_API_KEY = '1f8e47e9-fcc5-4c26-8702-06e415fee0aa';

export const fetchTravelInfo = createAsyncThunk(
  'nav/fetchTravelInfo',
  async ({ origin, destination }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://graphhopper.com/api/1/route`, {
        params: {
          point: `${origin.lat},${origin.lng}`,
          point: `${destination.lat},${destination.lng}`,
          vehicle: 'car',
          key: GRAPH_HOPPER_API_KEY,
        },
      });

      // Assuming response data is correctly structured and contains the distance and time info
      const distanceInMeters = response.data.paths[0].distance; // Ensure this matches the actual response structure
      const timeInSeconds = response.data.paths[0].time; // Ensure this matches the actual response structure

      return {
        distance: distanceInMeters / 1000, // Convert distance to kilometers
        duration: timeInSeconds / 3600, // Convert time to hours
      };
    } catch (error) {
      console.error('Error fetching travel info:', error); // Enhanced error logging
      return rejectWithValue(error.response?.data || 'Unknown error'); // Improved error handling
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
    travelDistance: null, // Added travelDistance to the initial state
    fetchStatus: 'idle',
    error: null,
  },
  reducers: {
    // Reducer methods unchanged
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTravelInfo.pending, (state) => {
        console.log('Travel info fetch started');
        state.fetchStatus = 'loading';
      })
      .addCase(fetchTravelInfo.fulfilled, (state, action) => {
        console.log('Travel info fetch succeeded');
        state.fetchStatus = 'succeeded';
        state.travelTimeInformation = action.payload;
      })
      .addCase(fetchTravelInfo.rejected, (state, action) => {
        console.error('Travel info fetch failed:', action.payload);
        state.fetchStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setOrigin, setDestination, setSelectedRideOption, setTravelTimeInformation, clearError } = navSlice.actions;

// Selector methods unchanged
export const selectOrigin = (state) => state.nav.origin;
export const selectDestination = (state) => state.nav.destination;
export const selectSelectedRideOption = (state) => state.nav.selectedRideOption;
export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation;
export const selectTravelDistance = (state) => state.nav.travelDistance;
export const selectFetchStatus = (state) => state.nav.fetchStatus;
export const selectError = (state) => state.nav.error;

export default navSlice.reducer;
