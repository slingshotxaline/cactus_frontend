import { apiSlice } from "../../redux/apiSlice";

export const returnsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReturnRequest: builder.mutation({
      query: (body) => ({ url: "/returns", method: "POST", body }),
      invalidatesTags: ["Return"],
    }),
    getMyReturns: builder.query({
      query: () => "/returns/my",
      providesTags: ["Return"],
    }),
    getAllReturns: builder.query({
      query: (params) => ({ url: "/returns", params }),
      providesTags: ["Return"],
    }),
    updateReturnStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/returns/${id}/status`, method: "PATCH", body }),
      invalidatesTags: ["Return"],
    }),
  }),
});

export const {
  useCreateReturnRequestMutation,
  useGetMyReturnsQuery,
  useGetAllReturnsQuery,
  useUpdateReturnStatusMutation,
} = returnsApi;
