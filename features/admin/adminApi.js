import { apiSlice } from "../../redux/apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: (params) => ({ url: "/analytics/summary", params }),
      providesTags: ["DashboardSummary"],
    }),
    getSalesAnalytics: builder.query({
      query: (params) => ({ url: "/analytics/sales", params }),
      providesTags: ["DashboardSummary"],
    }),
    getProductAnalytics: builder.query({
      query: () => "/analytics/products",
      providesTags: ["DashboardSummary"],
    }),
    getAllOrders: builder.query({
      query: (params) => ({ url: "/orders", params }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status, note },
      }),
      invalidatesTags: ["Order", "DashboardSummary"],
    }),
    getCoupons: builder.query({
      query: () => "/coupons",
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({ url: "/coupons", method: "POST", body }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupon"],
    }),
    getAdminNotifications: builder.query({
      query: () => "/notifications/admin",
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetSalesAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetAdminNotificationsQuery,
} = adminApi;
