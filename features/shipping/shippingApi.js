import { apiSlice } from "../../redux/apiSlice";

export const shippingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveShippingZones: builder.query({
      query: () => "/shipping-zones",
      providesTags: ["ShippingZone"],
    }),
    getAllShippingZones: builder.query({
      query: () => "/shipping-zones/admin",
      providesTags: ["ShippingZone"],
    }),
    createShippingZone: builder.mutation({
      query: (body) => ({ url: "/shipping-zones", method: "POST", body }),
      invalidatesTags: ["ShippingZone"],
    }),
    updateShippingZone: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/shipping-zones/${id}`, method: "PATCH", body }),
      invalidatesTags: ["ShippingZone"],
    }),
    deleteShippingZone: builder.mutation({
      query: (id) => ({ url: `/shipping-zones/${id}`, method: "DELETE" }),
      invalidatesTags: ["ShippingZone"],
    }),
  }),
});

export const {
  useGetActiveShippingZonesQuery,
  useGetAllShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
} = shippingApi;