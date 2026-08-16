"use client";

import Link from "next/link";
import { useGetProductInventoryHistoryQuery } from "../../../../features/inventory/inventoryApi";

const TYPE_COLORS = {
  purchase: "text-green-600",
  incoming: "text-blue-600",
  sale: "text-gray-500",
  return: "text-purple-600",
  damaged: "text-red-600",
  adjustment: "text-amber-600",
};

export default function InventoryHistoryPage({ params }) {
  const { data, isLoading } = useGetProductInventoryHistoryQuery(
    params.productId
  );
  const transactions = data?.data || [];

  return (
    <div>
      <Link
        href="/admin/inventory"
        className="text-sm text-gray-400 hover:underline"
      >
        ← Back to Inventory
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Stock History</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Change</th>
              <th className="py-2 pr-4">New Qty</th>
              <th className="py-2 pr-4">Reason</th>
              <th className="py-2 pr-4">By</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-b border-gray-50">
                <td className="py-3 pr-4 text-gray-500">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td
                  className={`py-3 pr-4 font-medium ${
                    TYPE_COLORS[t.type] || "text-gray-700"
                  }`}
                >
                  {t.type}
                </td>
                <td
                  className={`py-3 pr-4 font-semibold ${
                    t.quantityChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.quantityChange > 0 ? "+" : ""}
                  {t.quantityChange}
                </td>
                <td className="py-3 pr-4">{t.newQuantity}</td>
                <td className="py-3 pr-4 text-gray-500">
                  {t.reason || t.reference || "—"}
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {t.performedBy?.name || "System"}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  No stock movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
