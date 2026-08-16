import { apiSlice } from "../../redux/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    logoutAllDevices: builder.mutation({
      query: () => ({ url: "/auth/logout-all", method: "POST" }),
    }),
    // Uses the httpOnly refresh cookie — no body needed. Called on app load
    // to silently restore a session after a page reload.
    refresh: builder.mutation({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    setPassword: builder.mutation({
      query: (body) => ({ url: "/auth/set-password", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutAllDevicesMutation,
  useRefreshMutation,
  useGetMeQuery,
  useSetPasswordMutation,
} = authApi;
