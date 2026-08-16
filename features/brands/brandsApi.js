import { apiSlice } from "../../redux/apiSlice";

export const brandsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query({
      query: () => "/brands",
      providesTags: ["Brand"],
    }),
    listAllBrands: builder.query({
      query: () => "/brands/all",
      providesTags: ["Brand"],
    }),
    createBrand: builder.mutation({
      query: (body) => ({ url: "/brands", method: "POST", body }),
      invalidatesTags: ["Brand"],
    }),
    updateBrand: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Brand"],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({ url: `/brands/${id}`, method: "DELETE" }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useListAllBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;
