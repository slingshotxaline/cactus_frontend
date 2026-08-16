import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  // authChecked starts false and flips to true once the initial session
  // bootstrap (useAuthBootstrap) resolves — lets components like AdminGate
  // distinguish "not logged in" from "haven't checked yet" and avoid
  // bouncing a legitimately logged-in staff member on page refresh.
  initialState: { user: null, accessToken: null, isAuthenticated: false, authChecked: false },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.authChecked = true;
    },
    setAccessTokenOnly: (state, action) => {
      state.accessToken = action.payload;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authChecked = true;
    },
  },
});

export const { setCredentials, setAccessTokenOnly, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
