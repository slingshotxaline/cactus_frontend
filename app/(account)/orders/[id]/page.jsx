"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetOrderQuery } from "../../../../features/orders/ordersApi";
import { useInitiatePaymentMutation } from "../../../../features/payment/paymentApi";
import DownloadFileButton from "../../../../components/shared/DownloadFileButton";

const RETURNABLE_STATUSES = ["delivered", "completed"];

export default function OrderDetailPage({ params }) {
  const { data, isLoading } = useGetOrderQuery(params.id);
  const [initiatePayment, { isLoading: isRetrying }] =
    useInitiatePaymentMutation();
  const [retryError, setRetryError] = useState("");

  if (isLoading)
    return <div className="max-w-2xl mx-auto px-4 py-16">Loading order...</div>;
  const order = data?.data?.order;
  if (!order)
    return <div className="max-w-2xl mx-auto px-4 py-16">Order not found.</div>;

  const canRetryPayment =
    order.paymentMethod !== "cod" && order.paymentStatus !== "paid";

  const handleRetryPayment = async () => {
    setRetryError("");
    try {
      const result = await initiatePayment({ orderId: order._id }).unwrap();
      if (result.data.redirectUrl)
        window.location.href = result.data.redirectUrl;
    } catch (err) {
      setRetryError(
        err?.data?.message || "Could not start payment. Please try again."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-gray-500 mb-6">
        Status:{" "}
        <span className="font-medium text-gray-900">{order.status}</span> ·
        Payment:{" "}
        <span className="font-medium text-gray-900">{order.paymentStatus}</span>
      </p>

      {canRetryPayment && (
        <div className="mb-6 bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-sm text-amber-700">
            This order hasn't been paid yet. If your payment was interrupted,
            you can try again.
          </p>
          <button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="mt-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isRetrying ? "Starting payment..." : "Complete Payment"}
          </button>
          {retryError && (
            <p className="text-sm text-red-600 mt-2">{retryError}</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {order.items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between border-b border-gray-100 pb-2"
          >
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>৳{item.subtotal.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>৳{order.subtotal.toLocaleString()}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-৳{order.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>
            Shipping
            {order.shippingZoneName ? ` (${order.shippingZoneName})` : ""}
          </span>
          <span>৳{order.shippingCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2">
          <span>Total</span>
          <span>৳{order.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <DownloadFileButton
          path={`/invoices/${order._id}`}
          className="text-sm text-brand-500 hover:underline"
        >
          Download Invoice (PDF)
        </DownloadFileButton>
        {RETURNABLE_STATUSES.includes(order.status) && (
          <Link
            href={`/orders/${order._id}/return`}
            className="text-sm text-brand-500 hover:underline"
          >
            Request a Return
          </Link>
        )}
      </div>
    </div>
  );
}
