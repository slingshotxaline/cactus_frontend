"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  Truck,
  Search,
  ImageOff,
  SlidersHorizontal,
  History,
  ClipboardX,
} from "lucide-react";
import { useGetInventoryOverviewQuery } from "../../features/inventory/inventoryApi";
import { cleanParams } from "../../lib/queryParams";
import StockAdjustModal from "../admin/StockAdjustModal";
import StatCard from "../admin/StatCard";

const MOVEMENT_FIELDS = [
  { key: "reservedStock", label: "Reserved" },
  { key: "soldStock", label: "Sold" },
  { key: "damagedStock", label: "Damaged" },
  { key: "returnedStock", label: "Returned" },
  { key: "incomingStock", label: "Incoming" },
];

function StockLevel({ current, isLowStock }) {
  // Visual scale caps at 50 units just to give the bar a sensible max —
  // purely decorative, doesn't affect the actual number shown.
  const pct = Math.min(100, (current / 50) * 100);
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-semibold ${
          isLowStock ? "text-red-600" : "text-gray-900"
        }`}
      >
        {current}
      </span>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            isLowStock ? "bg-red-400" : "bg-emerald-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProductThumb({ src }) {
  if (!src) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <ImageOff className="h-4 w-4 text-gray-300" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
    />
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
          <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
          <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function InventoryContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(
    searchParams.get("lowStockOnly") === "true"
  );
  const [adjustingRow, setAdjustingRow] = useState(null);
  const [rowsIn, setRowsIn] = useState(false);

  const { data, isLoading } = useGetInventoryOverviewQuery(
    cleanParams({ search, lowStockOnly: lowStockOnly || undefined })
  );

  const rows = data?.data || [];

  const { totalSkus, lowStockCount, totalUnits, incomingCount } =
    useMemo(() => {
      return {
        totalSkus: rows.length,
        lowStockCount: rows.filter((r) => r.isLowStock).length,
        totalUnits: rows.reduce((sum, r) => sum + (r.currentStock || 0), 0),
        incomingCount: rows.filter((r) => r.incomingStock > 0).length,
      };
    }, [rows]);

  useEffect(() => {
    if (isLoading) {
      setRowsIn(false);
      return;
    }
    const t = setTimeout(() => setRowsIn(true), 30);
    return () => clearTimeout(t);
  }, [isLoading, rows.length]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Boxes}
          label="Tracked SKUs"
          value={totalSkus}
          accent="sky"
          loading={isLoading}
          index={0}
        />
        <StatCard
          icon={PackageCheck}
          label="Units in Stock"
          value={totalUnits}
          accent="violet"
          loading={isLoading}
          index={1}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockCount}
          accent={lowStockCount > 0 ? "rose" : "emerald"}
          pulse={lowStockCount > 0}
          loading={isLoading}
          index={2}
        />
        <StatCard
          icon={Truck}
          label="Incoming Shipments"
          value={incomingCount}
          accent="amber"
          loading={isLoading}
          index={3}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          onClick={() => setLowStockOnly((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
            lowStockOnly
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Low stock only
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <ClipboardX className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            No inventory records match
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try a different search or clear the low stock filter.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="grid gap-3 xl:hidden">
            {rows.map((row, i) => (
              <div
                key={`${row.product._id}-${row.variantId || "base"}`}
                className={`rounded-xl border p-4 shadow-sm transition-all duration-500 ease-out ${
                  row.isLowStock
                    ? "border-red-100 bg-red-50/30"
                    : "border-gray-100 bg-white"
                } ${
                  rowsIn
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <ProductThumb src={row.product.image} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {row.product.title}
                    </p>
                    {row.variantLabel && (
                      <p className="text-xs text-gray-400">
                        {row.variantLabel}
                      </p>
                    )}
                  </div>
                  <StockLevel
                    current={row.currentStock}
                    isLowStock={row.isLowStock}
                  />
                </div>

                <div className="mt-3 grid grid-cols-5 gap-2 border-t border-gray-100 pt-3 text-center">
                  {MOVEMENT_FIELDS.map((f) => (
                    <div key={f.key}>
                      <p className="text-sm font-medium text-gray-700">
                        {row[f.key]}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {f.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-4 border-t border-gray-50 pt-3 text-sm">
                  <button
                    onClick={() => setAdjustingRow(row)}
                    className="text-brand-500 hover:underline"
                  >
                    Adjust
                  </button>
                  <Link
                    href={`/admin/inventory/${row.product._id}`}
                    className="text-gray-400 hover:underline"
                  >
                    History
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 xl:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Current</th>
                    {MOVEMENT_FIELDS.map((f) => (
                      <th key={f.key} className="px-4 py-3 font-medium">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={`${row.product._id}-${row.variantId || "base"}`}
                      className={`border-b border-gray-50 transition-colors duration-500 last:border-0 ${
                        row.isLowStock
                          ? "bg-red-50/40 hover:bg-red-50/60"
                          : "hover:bg-gray-50/60"
                      } ${rowsIn ? "opacity-100" : "opacity-0"}`}
                      style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <ProductThumb src={row.product.image} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {row.product.title}
                            </p>
                            {row.variantLabel && (
                              <p className="truncate text-xs text-gray-400">
                                {row.variantLabel}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StockLevel
                          current={row.currentStock}
                          isLowStock={row.isLowStock}
                        />
                      </td>
                      {MOVEMENT_FIELDS.map((f) => (
                        <td key={f.key} className="px-4 py-3 text-gray-500">
                          {row[f.key]}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <button
                            onClick={() => setAdjustingRow(row)}
                            className="text-brand-500 hover:underline"
                          >
                            Adjust
                          </button>
                          <Link
                            href={`/admin/inventory/${row.product._id}`}
                            className="inline-flex items-center gap-1 text-gray-400 hover:underline"
                          >
                            <History className="h-3.5 w-3.5" />
                            History
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {adjustingRow && (
        <StockAdjustModal
          row={adjustingRow}
          onClose={() => setAdjustingRow(null)}
        />
      )}
    </div>
  );
}
