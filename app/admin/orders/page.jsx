"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Loader2,
  PackageSearch,
  ClipboardList,
} from "lucide-react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../../features/admin/adminApi";
import ExportCsvButton from "../../../components/admin/ExportCsvButton";
import StatCard from "../../../components/admin/StatCard";
import StatusBadge, {
  STATUS_META,
} from "../../../components/admin/StatusBadge";

const STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "returned",
  "refunded",
  "failed",
];

// Payment status values that actually exist on the Order model
// (paymentStatus field) — separate from order.status above.
const PAYMENT_STATUSES = ["paid", "pending", "refunded", "failed"];
const PAYMENT_META = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  refunded: "border-rose-200 bg-rose-50 text-rose-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

function FilterTabs({ label, options, value, onChange, meta }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
            value === "all"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {options.map((opt) => {
          const active = value === opt;
          const optClasses = meta?.[opt] || "border-gray-200 text-gray-500";
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                active
                  ? "border-gray-900 bg-gray-900 text-white"
                  : `${optClasses} hover:opacity-75`
              }`}
            >
              {(STATUS_META[opt]?.label ?? opt).replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusSelect({ order, updatingId, onChange }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const isUpdating = updatingId === order._id;

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 rounded-full border py-1.5 pl-3 pr-7 text-xs font-medium transition-colors ${meta.classes}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
      <select
        value={order.status}
        disabled={isUpdating}
        onChange={(e) => onChange(order, e.target.value)}
        className="cursor-pointer appearance-none bg-transparent text-xs font-medium capitalize outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s]?.label ?? s}
          </option>
        ))}
      </select>
      {isUpdating ? (
        <Loader2 className="absolute right-2 h-3 w-3 animate-spin" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 opacity-50" />
      )}
    </div>
  );
}

function StatusCountCard({ status, count, index }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150 + index * 40);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-sm ${
        meta.classes
      } ${mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{count}</p>
        <p className="mt-1 truncate text-xs font-medium capitalize opacity-80">
          {meta.label}
        </p>
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[60px] animate-pulse rounded-xl bg-gray-100"
        />
      ))}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-gray-100 p-4"
        >
          <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          <div className="ml-auto h-6 w-24 animate-pulse rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const queryParams = useMemo(
    () => ({
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(paymentFilter !== "all" && { paymentStatus: paymentFilter }),
    }),
    [statusFilter, paymentFilter]
  );

  const { data, isLoading, isFetching } = useGetAllOrdersQuery(queryParams);
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState(null);
  const [rowsIn, setRowsIn] = useState(false);

  const orders = data?.data || [];

  // Status breakdown reflects the currently filtered order set (e.g. if
  // Payment = Paid is active, these counts are "paid orders by status").
  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const order of orders) {
      if (counts[order.status] !== undefined) counts[order.status] += 1;
    }
    return counts;
  }, [orders]);

  useEffect(() => {
    if (isLoading || isFetching) {
      setRowsIn(false);
      return;
    }
    const t = setTimeout(() => setRowsIn(true), 30);
    return () => clearTimeout(t);
  }, [isLoading, isFetching]);

  async function handleStatusChange(order, newStatus) {
    setUpdatingId(order._id);
    try {
      await updateStatus({
        id: order._id,
        status: newStatus,
        note: `Status changed to ${newStatus}`,
      }).unwrap();
    } finally {
      setUpdatingId(null);
    }
  }

  const showSkeleton = isLoading || (isFetching && orders.length === 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {!isLoading && (
            <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              {orders.length}
            </span>
          )}
        </div>
        <ExportCsvButton path="/orders/export.csv" label="Export Orders CSV" />
      </div>

      {/* Total + status breakdown */}
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <StatCard
            icon={ClipboardList}
            label="Total Orders"
            value={orders.length}
            accent="sky"
            loading={showSkeleton}
            index={0}
          />
        </div>
        <div className="lg:col-span-3">
          {showSkeleton ? (
            <SkeletonStats />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {STATUSES.map((status, i) => (
                <StatusCountCard
                  key={status}
                  status={status}
                  count={statusCounts[status]}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showSkeleton ? (
        <SkeletonRows />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <PackageSearch className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            No orders match these filters
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try a different Payment or Status filter.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-8">
            <FilterTabs
              label="Payment"
              options={PAYMENT_STATUSES}
              value={paymentFilter}
              onChange={setPaymentFilter}
              meta={PAYMENT_META}
            />
            <FilterTabs
              label="Order Status"
              options={STATUSES}
              value={statusFilter}
              onChange={setStatusFilter}
              meta={Object.fromEntries(
                STATUSES.map((s) => [s, STATUS_META[s]?.classes])
              )}
            />
          </div>
          {/* Mobile: stacked cards */}
          <div className="grid gap-3 md:hidden">
            {orders.map((order, i) => (
              <div
                key={order._id}
                className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 ease-out ${
                  rowsIn
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="font-semibold text-gray-900 hover:text-brand-500"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {order.customer?.name || "—"}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-gray-900">
                    ৳{(order.total ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.paymentStatus} type="payment" />
                  <StatusSelect
                    order={order}
                    updatingId={updatingId}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Order #</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr
                      key={order._id}
                      className={`border-b border-gray-50 transition-colors duration-500 last:border-0 hover:bg-gray-50/60 ${
                        rowsIn ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="hover:text-brand-500"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        ৳{(order.total ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={order.paymentStatus}
                          type="payment"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          order={order}
                          updatingId={updatingId}
                          onChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-xs font-medium text-brand-500 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
