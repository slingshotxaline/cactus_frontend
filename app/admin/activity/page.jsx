"use client";

import { useState } from "react";
import { useGetActivityLogsQuery } from "../../../features/activity/activityApi";

const ACTION_COLORS = {
  "auth.login": "text-blue-600", "auth.logout": "text-gray-500", "auth.register": "text-blue-600",
  "product.create": "text-green-600", "product.update": "text-amber-600", "product.delete": "text-red-600",
  "order.statusUpdate": "text-purple-600",
  "coupon.create": "text-green-600", "coupon.update": "text-amber-600", "coupon.deactivate": "text-red-600",
};

export default function AdminActivityPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetActivityLogsQuery({ page, limit: 30 });
  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2 pr-4">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-50">
                  <td className="py-3 pr-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4">{log.user?.name || "System"} <span className="text-gray-400 text-xs">({log.user?.role})</span></td>
                  <td className={`py-3 pr-4 font-medium ${ACTION_COLORS[log.action] || "text-gray-700"}`}>{log.action}</td>
                  <td className="py-3 pr-4 text-gray-500">{log.entityType || "—"}</td>
                  <td className="py-3 pr-4 text-gray-400">{log.ipAddress}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No activity yet.</td></tr>
              )}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 py-1">Page {pagination.page} of {pagination.pages}</span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
