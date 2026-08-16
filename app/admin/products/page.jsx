"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  XCircle,
  Star,
  Pencil,
  Trash2,
  PlusCircle,
  ImageOff,
  PackageSearch,
  Search,
  X,
} from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../../features/products/productsApi";
import { getEffectivePrice, getProductImage } from "../../../utils/pricing";
import ExportCsvButton from "../../../components/admin/ExportCsvButton";
import StatCard from "../../../components/admin/StatCard";

const BADGES = [
  {
    key: "isFlashSale",
    label: "Flash",
    classes: "bg-red-50 text-red-600 border-red-100",
  },
  {
    key: "isHotSale",
    label: "Hot",
    classes: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    key: "isNewArrival",
    label: "New",
    classes: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    key: "isFeatured",
    label: "Featured",
    classes: "bg-violet-50 text-violet-600 border-violet-100",
  },
];

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        active
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Rating({ value, count }) {
  if (!value) return <span className="text-gray-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1 text-gray-700">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {value.toFixed(1)}
      <span className="text-xs text-gray-400">({count})</span>
    </span>
  );
}

function ProductThumb({ src, alt }) {
  if (!src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <ImageOff className="h-4 w-4 text-gray-300" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-100">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
      />
    </div>
  );
}

function BadgeRow({ product }) {
  const active = BADGES.filter((b) => product[b.key]);
  if (active.length === 0)
    return <span className="text-xs text-gray-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {active.map((b) => (
        <span
          key={b.key}
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${b.classes}`}
        >
          {b.label}
        </span>
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
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function AdminProductsPage() {
  const { data, isLoading } = useGetProductsQuery({ limit: 50 });
  const [deleteProduct] = useDeleteProductMutation();
  const [rowsIn, setRowsIn] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const products = data?.data || [];

  const { total, activeCount, inactiveCount } = useMemo(() => {
    const t = products.length;
    const a = products.filter((p) => p.isActive !== false).length;
    return { total: t, activeCount: a, inactiveCount: t - a };
  }, [products]);

  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const name = p.category?.name;
      if (name) map.set(name, (map.get(name) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === "active" && p.isActive === false) return false;
      if (statusFilter === "inactive" && p.isActive !== false) return false;
      if (categoryFilter !== "all" && p.category?.name !== categoryFilter)
        return false;
      if (q) {
        const haystack = `${p.title || ""} ${p.category?.name || ""} ${
          p.brand?.name || ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, statusFilter, categoryFilter]);

  useEffect(() => {
    if (isLoading) {
      setRowsIn(false);
      return;
    }
    const t = setTimeout(() => setRowsIn(true), 30);
    return () => clearTimeout(t);
  }, [isLoading, filteredProducts.length]);

  const handleDeactivate = (p) => {
    if (confirm(`Deactivate "${p.title}"?`)) deleteProduct(p._id);
  };

  const hasFilters =
    search || statusFilter !== "all" || categoryFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-3">
          <ExportCsvButton
            path="/products/export.csv"
            label="Export Products CSV"
          />
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stat cards double as quick filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button onClick={() => setStatusFilter("all")} className="text-left">
          <StatCard
            icon={Package}
            label="Total Products"
            value={total}
            accent="violet"
            loading={isLoading}
            index={0}
          />
        </button>
        <button onClick={() => setStatusFilter("active")} className="text-left">
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={activeCount}
            accent="emerald"
            loading={isLoading}
            index={1}
          />
        </button>
        <button
          onClick={() => setStatusFilter("inactive")}
          className="text-left"
        >
          <StatCard
            icon={XCircle}
            label="Inactive"
            value={inactiveCount}
            accent="rose"
            loading={isLoading}
            index={2}
          />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search by title, category, or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-9 text-sm outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="mb-3 inline-flex rounded-lg border border-gray-100 bg-gray-50/60 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              categoryFilter === "all"
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            All categories
          </button>
          {categories.map(([name, count]) => (
            <button
              key={name}
              onClick={() => setCategoryFilter(name)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === name
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {name} <span className="opacity-60">({count})</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <SkeletonRows />
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <PackageSearch className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            {hasFilters ? "No products match your filters" : "No products yet"}
          </p>
          {hasFilters ? (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-brand-500 hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/admin/products/new"
              className="mt-3 text-sm text-brand-500 hover:underline"
            >
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="grid gap-3 lg:hidden">
            {filteredProducts.map((p, i) => (
              <div
                key={p._id}
                className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 ease-out ${
                  rowsIn
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <ProductThumb src={getProductImage(p)} alt={p.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {p.category?.name || "—"}{" "}
                      {p.brand?.name ? `· ${p.brand.name}` : ""}
                    </p>
                  </div>
                  <StatusPill active={p.isActive !== false} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">
                    ৳{getEffectivePrice(p).toLocaleString()}
                  </span>
                  <Rating value={p.ratingsAverage} count={p.ratingsCount} />
                </div>
                <div className="mt-2">
                  <BadgeRow product={p} />
                </div>
                <div className="mt-3 flex gap-4 border-t border-gray-50 pt-3 text-sm">
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="inline-flex items-center gap-1 text-brand-500 hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeactivate(p)}
                    className="inline-flex items-center gap-1 text-red-500 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Brand</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Tags</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr
                      key={p._id}
                      className={`border-b border-gray-50 transition-colors duration-500 last:border-0 hover:bg-gray-50/60 ${
                        rowsIn ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb
                            src={getProductImage(p)}
                            alt={p.title}
                          />
                          <span className="font-medium text-gray-900">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.brand?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        ৳{getEffectivePrice(p).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <BadgeRow product={p} />
                      </td>
                      <td className="px-4 py-3">
                        <Rating
                          value={p.ratingsAverage}
                          count={p.ratingsCount}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill active={p.isActive !== false} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <Link
                            href={`/admin/products/${p._id}/edit`}
                            className="inline-flex items-center gap-1 text-brand-500 hover:underline"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeactivate(p)}
                            className="inline-flex items-center gap-1 text-red-500 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Deactivate
                          </button>
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
    </div>
  );
}
