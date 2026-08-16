import { apiSlice } from "../../redux/apiSlice";

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query({
      query: (params) => ({ url: "/activity-logs", params }),
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityApi;
