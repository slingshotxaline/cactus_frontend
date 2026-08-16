import { apiSlice } from "../../redux/apiSlice";

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: (result, error, productId) => [{ type: "Review", id: productId }],
    }),
    createReview: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: "Review", id: productId }, "Product"],
    }),
    voteHelpful: builder.mutation({
      query: (reviewId) => ({ url: `/reviews/${reviewId}/helpful`, method: "POST" }),
    }),
  }),
});

export const { useGetProductReviewsQuery, useCreateReviewMutation, useVoteHelpfulMutation } = reviewsApi;
