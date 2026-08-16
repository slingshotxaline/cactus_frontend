"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";
import { useGetCustomersQuery } from "../../../features/customers/customersApi";
import { cleanParams } from "../../../lib/queryParams";
import ExportCsvButton from "../../../components/admin/ExportCsvButton";
import StatCard from "../../../components/admin/StatCard";

function TypeBadge({ isGuest }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isGuest
          ? "border-amber-100 bg-amber-50 text-amber-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isGuest ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />
      {isGuest ? "Guest" : "Registered"}
    </span>
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
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
          <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useGetCustomersQuery(
    cleanParams({ search })
  );
  const [rowsIn, setRowsIn] = useState(false);

  const customers = data?.data || [];

  const { total, registeredCount, guestCount } = useMemo(() => {
    const t = customers.length;
    const guests = customers.filter((c) => c.isGuest).length;
    return { total: t, registeredCount: t - guests, guestCount: guests };
  }, [customers]);

  useEffect(() => {
    if (isLoading) {
      setRowsIn(false);
      return;
    }
    const t = setTimeout(() => setRowsIn(true), 30);
    return () => clearTimeout(t);
  }, [isLoading, customers.length]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          {!isLoading && !isError && (
            <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              {customers.length}
            </span>
          )}
        </div>
        <ExportCsvButton
          path="/users/customers/export.csv"
          label="Export Customers CSV"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={total}
          accent="sky"
          loading={isLoading}
          index={0}
        />
        <StatCard
          icon={UserCheck}
          label="Registered"
          value={registeredCount}
          accent="emerald"
          loading={isLoading}
          index={1}
        />
        <StatCard
          icon={UserX}
          label="Guest"
          value={guestCount}
          accent="amber"
          loading={isLoading}
          index={2}
        />
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-red-300" />
          <p className="mt-3 text-sm font-medium text-red-600">
            Could not load customers
          </p>
          <p className="mt-1 text-xs text-red-400">
            You may not have permission, or there was a network error.
          </p>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <Users className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            No customers found
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try a different search term.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="grid gap-3 md:hidden">
            {customers.map((c, i) => (
              <div
                key={c._id}
                className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 ease-out ${
                  rowsIn
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <TypeBadge isGuest={c.isGuest} />
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {c.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {c.phone}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Joined {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr
                      key={c._id}
                      className={`border-b border-gray-50 transition-colors duration-500 last:border-0 hover:bg-gray-50/60 ${
                        rowsIn ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ transitionDelay: `${Math.min(i, 10) * 40}ms` }}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge isGuest={c.isGuest} />
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
