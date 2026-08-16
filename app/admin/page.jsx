"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetDashboardSummaryQuery } from "../../features/admin/adminApi";
import { useGetInventoryOverviewQuery } from "../../features/inventory/inventoryApi";
import StatCard from "../../components/admin/StatCard";

const REVENUE_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last Month", value: "1m" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last 1 Year", value: "1y" },
  { label: "Last 2 Years", value: "2y" },
];

export default function AdminOverviewPage() {
  const [range, setRange] = useState("all");

  const { data, isLoading, isFetching } = useGetDashboardSummaryQuery({
    range,
  });
  const { data: inventoryData } = useGetInventoryOverviewQuery({
    lowStockOnly: true,
  });
  const summary = data?.data;
  const lowStockCount = inventoryData?.data?.length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Overview</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          {REVENUE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Revenue"
              value={summary?.totalRevenue ?? 0}
              prefix="৳"
              sublabel="Collected & confirmed"
              loading={isFetching}
            />
            <StatCard label="Orders Today" value={summary?.ordersToday ?? 0} />
            <StatCard
              label="Pending Orders"
              value={summary?.pendingOrders ?? 0}
            />
            <StatCard
              label="Active Products"
              value={summary?.productCount ?? 0}
            />
            <StatCard label="Customers" value={summary?.customerCount ?? 0} />
            <Link href="/admin/inventory?lowStockOnly=true">
              <StatCard
                label="Low Stock Items"
                value={lowStockCount}
                sublabel={lowStockCount > 0 ? "Click to review" : "All good"}
              />
            </Link>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-3">Money In Motion</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Pending COD"
              value={summary?.pendingCodRevenue ?? 0}
              prefix="৳"
              sublabel={`${
                summary?.pendingCodOrderCount ?? 0
              } order(s) not yet delivered`}
              loading={isFetching}
            />
            <StatCard
              label="Refunded"
              value={summary?.totalRefunded ?? 0}
              prefix="৳"
              sublabel={`${summary?.refundedOrderCount ?? 0} order(s)`}
              loading={isFetching}
            />
            <StatCard
              label="Cancelled (value)"
              value={summary?.totalCancelled ?? 0}
              prefix="৳"
              sublabel={`${summary?.cancelledOrderCount ?? 0} order(s)`}
              loading={isFetching}
            />
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Total Revenue only counts money actually collected — paid prepaid
            orders, and COD orders once marked Delivered. Cancelling or
            returning an already-paid order automatically removes it from Total
            Revenue and shows here as Refunded/Cancelled instead.
            <br />
            For bKash/SSLCommerz orders, this internal number updates
            immediately, but you still need to issue the actual refund from that
            gateway's own dashboard.
          </p>
        </>
      )}
    </div>
  );
}
