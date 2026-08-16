import { apiSlice } from "../../redux/apiSlice";

export const recommendationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSimilarProducts: builder.query({
      query: (productId) => `/recommendations/${productId}/similar`,
    }),
    getFrequentlyBoughtTogether: builder.query({
      query: (productId) => `/recommendations/${productId}/frequently-bought-together`,
    }),
    getRecommendedForMe: builder.query({
      query: () => "/recommendations/for-me",
    }),
    getTrending: builder.query({
      query: () => "/recommendations/trending",
    }),
  }),
});

export const {
  useGetSimilarProductsQuery,
  useGetFrequentlyBoughtTogetherQuery,
  useGetRecommendedForMeQuery,
  useGetTrendingQuery,
} = recommendationsApi;
