// frontend/features/customers/customersApi.js
import { apiSlice } from "../../redux/apiSlice";

export const customersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({ url: "/users/customers", params }),
      providesTags: ["Customer"],
    }),
  }),
});

export const { useGetCustomersQuery } = customersApi;