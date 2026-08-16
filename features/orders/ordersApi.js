import { apiSlice } from "../../redux/apiSlice";

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    createGuestOrder: builder.mutation({
      query: (body) => ({ url: "/orders/guest", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    getMyOrders: builder.query({
      query: () => "/orders/my",
      providesTags: ["Order"],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateGuestOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
} = ordersApi;