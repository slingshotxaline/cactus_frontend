"use client";

import { useState } from "react";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} from "../../../features/admin/adminApi";

const emptyForm = { code: "", type: "percentage", value: 10, minPurchase: 0, userLimit: 1, expiresAt: "" };

export default function AdminCouponsPage() {
  const { data, isLoading } = useGetCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [form, setForm] = useState(emptyForm);

  const coupons = data?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCoupon(form).unwrap();
      setForm(emptyForm);
    } catch (err) {
      alert(err?.data?.message || "Could not create coupon.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>

      <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4 mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
        <input placeholder="CODE" required className="border rounded px-3 py-2 text-sm uppercase"
          value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <select className="border rounded px-3 py-2 text-sm" value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
          <option value="first_order">First Order</option>
          <option value="vip">VIP</option>
          <option value="festival">Festival</option>
        </select>
        <input type="number" placeholder="Value" required className="border rounded px-3 py-2 text-sm"
          value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <input type="number" placeholder="Min purchase" className="border rounded px-3 py-2 text-sm"
          value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })} />
        <input type="number" placeholder="Per-user limit" className="border rounded px-3 py-2 text-sm"
          value={form.userLimit} onChange={(e) => setForm({ ...form, userLimit: Number(e.target.value) })} />
        <input type="date" required className="border rounded px-3 py-2 text-sm"
          value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        <button type="submit" disabled={isCreating}
          className="col-span-2 md:col-span-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {isCreating ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Value</th>
              <th className="py-2 pr-4">Used</th>
              <th className="py-2 pr-4">Expires</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium">{c.code}</td>
                <td className="py-3 pr-4">{c.type}</td>
                <td className="py-3 pr-4">{c.value}{c.type === "percentage" ? "%" : "৳"}</td>
                <td className="py-3 pr-4">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="py-3 pr-4">{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td className="py-3 pr-4">
                  <button onClick={() => deleteCoupon(c._id)} className="text-red-500 hover:underline">
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-gray-400">No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
