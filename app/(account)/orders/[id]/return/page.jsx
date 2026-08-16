"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetOrderQuery } from "../../../../../features/orders/ordersApi";
import { useCreateReturnRequestMutation } from "../../../../../features/returns/returnsApi";

export default function RequestReturnPage({ params }) {
  const { data, isLoading } = useGetOrderQuery(params.id);
  const [createReturnRequest, { isLoading: isSubmitting }] = useCreateReturnRequestMutation();
  const router = useRouter();

  const [selectedItems, setSelectedItems] = useState({}); // orderItemId -> quantity
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-16">Loading...</div>;
  const order = data?.data?.order;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-16">Order not found.</div>;

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[item._id]) delete next[item._id];
      else next[item._id] = 1;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const items = order.items
      .filter((item) => selectedItems[item._id])
      .map((item) => ({
        orderItemId: item._id,
        product: item.product,
        quantity: selectedItems[item._id],
        reason,
      }));

    if (!items.length) return setError("Select at least one item to return.");

    try {
      await createReturnRequest({ orderId: order._id, items, reason }).unwrap();
      router.push("/orders");
    } catch (err) {
      setError(err?.data?.message || "Could not submit return request.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Request a Return</h1>
      <p className="text-gray-500 mb-6">Order {order.orderNumber}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <label key={item._id} className="flex items-center gap-3 border border-gray-100 rounded-lg p-3">
              <input
                type="checkbox"
                checked={!!selectedItems[item._id]}
                onChange={() => toggleItem(item)}
              />
              <span className="flex-1">{item.title} × {item.quantity}</span>
              <span className="text-gray-500">৳{item.subtotal.toLocaleString()}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium">Reason for return</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mt-1"
            placeholder="e.g. Item arrived damaged, wrong size, changed my mind..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Return Request"}
        </button>
      </form>
    </div>
  );
}
