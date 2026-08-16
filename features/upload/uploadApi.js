import { apiSlice } from "../../redux/apiSlice";

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (body) => ({ url: "/upload/image", method: "POST", body }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
