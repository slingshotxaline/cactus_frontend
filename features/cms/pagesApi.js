import { apiSlice } from "../../redux/apiSlice";

export const pagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPageBySlug: builder.query({
      query: (slug) => `/pages/${slug}`,
    }),
    getActiveBanners: builder.query({
      query: (placement) => ({ url: "/banners/active", params: { placement } }),
    }),
    listPages: builder.query({
      query: () => "/pages",
      providesTags: ["Page"],
    }),
    upsertPage: builder.mutation({
      query: (body) => ({ url: "/pages", method: "PUT", body }),
      invalidatesTags: ["Page"],
    }),
    listBanners: builder.query({
      query: () => "/banners",
      providesTags: ["Banner"],
    }),
    createBanner: builder.mutation({
      query: (body) => ({ url: "/banners", method: "POST", body }),
      invalidatesTags: ["Banner"],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({ url: `/banners/${id}`, method: "DELETE" }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetPageBySlugQuery,
  useGetActiveBannersQuery,
  useListPagesQuery,
  useUpsertPageMutation,
  useListBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
} = pagesApi;
