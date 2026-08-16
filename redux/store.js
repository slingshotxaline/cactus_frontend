import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import compareReducer from "../features/compare/compareSlice";
import recentlyViewedReducer from "../features/recentlyViewed/recentlyViewedSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    cart: cartReducer,
    compare: compareReducer,
    recentlyViewed: recentlyViewedReducer,
  },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});
