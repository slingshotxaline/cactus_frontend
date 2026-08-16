import { apiSlice } from "../../redux/apiSlice";

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogPosts: builder.query({
      query: (params) => ({ url: "/blog", params }),
      providesTags: ["Blog"],
    }),
    getBlogPostBySlug: builder.query({
      query: (slug) => `/blog/${slug}`,
    }),
    listAllBlogPosts: builder.query({
      query: () => "/blog/all",
      providesTags: ["Blog"],
    }),
    createBlogPost: builder.mutation({
      query: (body) => ({ url: "/blog", method: "POST", body }),
      invalidatesTags: ["Blog"],
    }),
    updateBlogPost: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/blog/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Blog"],
    }),
    deleteBlogPost: builder.mutation({
      query: (id) => ({ url: `/blog/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogPostBySlugQuery,
  useListAllBlogPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} = blogApi;
