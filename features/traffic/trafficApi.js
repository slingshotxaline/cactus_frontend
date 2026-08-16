import { apiSlice } from "../../redux/apiSlice";

export const trafficApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTrafficSummary: builder.query({
      query: () => "/analytics/traffic/summary",
    }),
    getDailyTraffic: builder.query({
      query: (days) => ({ url: "/analytics/traffic/daily", params: { days } }),
    }),
    getTopPages: builder.query({
      query: (days) => ({ url: "/analytics/traffic/top-pages", params: { days } }),
    }),
    getTopClicks: builder.query({
      query: (days) => ({ url: "/analytics/traffic/top-clicks", params: { days } }),
    }),
    getDeviceBreakdown: builder.query({
      query: (days) => ({ url: "/analytics/traffic/devices", params: { days } }),
    }),
    getEventLog: builder.query({
      query: (params) => ({ url: "/analytics/traffic/log", params }),
    }),
  }),
});

export const {
  useGetTrafficSummaryQuery,
  useGetDailyTrafficQuery,
  useGetTopPagesQuery,
  useGetTopClicksQuery,
  useGetDeviceBreakdownQuery,
  useGetEventLogQuery,
} = trafficApi;