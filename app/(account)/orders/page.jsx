"use client";

import Link from "next/link";
import { useGetMyOrdersQuery } from "../../../features/orders/ordersApi";

const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-600",
  confirmed: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-red-50 text-red-600",
};

export default function MyOrdersPage() {
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:border-gray-200"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
                <span className="font-semibold">৳{order.total.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
