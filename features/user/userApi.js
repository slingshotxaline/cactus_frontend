import { apiSlice } from "../../redux/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/users/profile", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    addAddress: builder.mutation({
      query: (body) => ({ url: "/users/addresses", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateAddress: builder.mutation({
      query: ({ addressId, ...body }) => ({
        url: `/users/addresses/${addressId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = userApi;
