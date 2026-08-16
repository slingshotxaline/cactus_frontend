import { apiSlice } from "../../redux/apiSlice";

export const homepageSectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public — storefront homepage. Products come back already resolved.
    getActiveHomepageSections: builder.query({
      query: () => "/homepage-sections",
      providesTags: ["HomepageSection"],
    }),
    getAllHomepageSections: builder.query({
      query: () => "/homepage-sections/admin",
      providesTags: ["HomepageSection"],
    }),
    createHomepageSection: builder.mutation({
      query: (body) => ({ url: "/homepage-sections", method: "POST", body }),
      invalidatesTags: ["HomepageSection"],
    }),
    updateHomepageSection: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/homepage-sections/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["HomepageSection"],
    }),
    deleteHomepageSection: builder.mutation({
      query: (id) => ({ url: `/homepage-sections/${id}`, method: "DELETE" }),
      invalidatesTags: ["HomepageSection"],
    }),
  }),
});

export const {
  useGetActiveHomepageSectionsQuery,
  useGetAllHomepageSectionsQuery,
  useCreateHomepageSectionMutation,
  useUpdateHomepageSectionMutation,
  useDeleteHomepageSectionMutation,
} = homepageSectionsApi;
