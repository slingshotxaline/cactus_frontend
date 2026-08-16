import { apiSlice } from "../../redux/apiSlice";

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    smartSearch: builder.query({
      query: (q) => ({ url: "/search/smart", params: { q } }),
    }),
  }),
});

export const { useLazySmartSearchQuery } = searchApi;
