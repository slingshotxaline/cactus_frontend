"use client";

import { useGetAllReturnsQuery, useUpdateReturnStatusMutation } from "../../../features/returns/returnsApi";

const STATUSES = [
  "requested", "admin_review", "approved", "pickup_scheduled",
  "picked_up", "inspecting", "refunded", "rejected", "completed",
];

export default function AdminReturnsPage() {
  const { data, isLoading } = useGetAllReturnsQuery();
  const [updateStatus] = useUpdateReturnStatusMutation();
  const returns = data?.data || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Return Requests</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {returns.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{r.order?.orderNumber}</p>
                  <p className="text-sm text-gray-500">{r.customer?.name} · {r.customer?.email}</p>
                  <p className="text-sm text-gray-600 mt-2">{r.reason}</p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) =>
                    updateStatus({ id: r._id, status: e.target.value, note: `Status changed to ${e.target.value}` })
                  }
                  className="border rounded px-2 py-1 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 text-sm text-gray-500 space-y-1">
                {r.items.map((item, i) => (
                  <div key={i}>{item.quantity} × item ({item.reason})</div>
                ))}
              </div>
            </div>
          ))}
          {returns.length === 0 && <p className="text-gray-400">No return requests.</p>}
        </div>
      )}
    </div>
  );
}
