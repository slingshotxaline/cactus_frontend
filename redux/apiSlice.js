// frontend/redux/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: rawBaseQuery,
  tagTypes: [
    "Product",
    "Category",
    "Brand",
    "Order",
    "Cart",
    "User",
    "Customer",
    "Review",
    "Wishlist",
    "Coupon",
    "Notification",
    "Return",
    "Blog",
    "Page",
    "Banner",
    "Inventory",
    "ShippingZone",
    "HomepageSection",
    "DashboardSummary",
    
  ],
  endpoints: () => ({}),
});
