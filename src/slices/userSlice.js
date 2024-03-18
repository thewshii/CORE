// src/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial state of the user slice
const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to set the user data
    setUser: (state, action) => {
      state.user = action.payload;
    },

    // Action to clear the user data (optional, can be used for logging out)
    clearUser: (state) => {
      state.user = null;
    },
  },
});

// Export the action creators
export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (state) => state.user.user;


// Default export the reducer
export default userSlice.reducer;
