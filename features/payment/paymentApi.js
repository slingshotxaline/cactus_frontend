import { apiSlice } from "../../redux/apiSlice";

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiatePayment: builder.mutation({
      query: (body) => ({ url: "/payments/initiate", method: "POST", body }),
    }),
  }),
});

export const { useInitiatePaymentMutation } = paymentApi;
