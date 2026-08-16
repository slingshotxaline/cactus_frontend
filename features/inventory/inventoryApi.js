import { apiSlice } from "../../redux/apiSlice";

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryOverview: builder.query({
      query: (params) => ({ url: "/inventory", params }),
      providesTags: ["Inventory"],
    }),
    adjustStock: builder.mutation({
      query: (body) => ({ url: "/inventory/adjust", method: "POST", body }),
      invalidatesTags: ["Inventory", "Product"],
    }),
    getProductInventoryHistory: builder.query({
      query: (productId) => `/inventory/${productId}/history`,
    }),
  }),
});

export const {
  useGetInventoryOverviewQuery,
  useAdjustStockMutation,
  useGetProductInventoryHistoryQuery,
} = inventoryApi;