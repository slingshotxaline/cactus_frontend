import { apiSlice } from "../../redux/apiSlice";

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mirrors the Redux cart to the server so the abandoned-cart cron job has
    // something to read. Fire-and-forget from the frontend's perspective.
    syncCart: builder.mutation({
      query: (items) => ({ url: "/cart/sync", method: "PUT", body: { items } }),
    }),
  }),
});

export const { useSyncCartMutation } = cartApi;
