"use client";

import { useState } from "react";
import {
  useGetAllShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
} from "../../../features/shipping/shippingApi";

const emptyForm = { name: "", key: "", charge: "", description: "" };

const toKey = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

export default function AdminShippingPage() {
  const { data, isLoading } = useGetAllShippingZonesQuery();
  const [createZone, { isLoading: isCreating }] =
    useCreateShippingZoneMutation();
  const [updateZone] = useUpdateShippingZoneMutation();
  const [deleteZone] = useDeleteShippingZoneMutation();

  const [form, setForm] = useState(emptyForm);
  const [editingCharges, setEditingCharges] = useState({});
  const [error, setError] = useState("");

  const zones = data?.data || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createZone({ ...form, charge: Number(form.charge) }).unwrap();
      setForm(emptyForm);
    } catch (err) {
      setError(err?.data?.message || "Could not create shipping zone.");
    }
  };

  const commitChargeEdit = async (zoneId) => {
    const value = editingCharges[zoneId];
    if (value === undefined) return;
    await updateZone({ id: zoneId, charge: Number(value) });
    setEditingCharges((prev) => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Shipping Zones</h1>
      <p className="text-sm text-gray-500 mb-6">
        Set delivery charges by zone — e.g. Inside Dhaka vs Outside Dhaka.
        Changes apply immediately to new orders at checkout.
      </p>

      <form
        onSubmit={handleCreate}
        className="border border-gray-100 rounded-xl p-4 mb-8 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <input
          placeholder="Zone name (e.g. Inside Dhaka)"
          required
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
              key: toKey(e.target.value),
            })
          }
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <input
          placeholder="Charge (৳)"
          type="number"
          min={0}
          required
          value={form.charge}
          onChange={(e) => setForm({ ...form, charge: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {isCreating ? "Adding..." : "+ Add Zone"}
        </button>
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border rounded px-3 py-2 text-sm col-span-3"
        />
        {error && <p className="text-sm text-red-600 col-span-4">{error}</p>}
      </form>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Zone</th>
              <th className="py-2 pr-4">Key</th>
              <th className="py-2 pr-4">Charge (৳)</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone._id} className="border-b border-gray-50">
                <td className="py-3 pr-4">
                  <p className="font-medium">{zone.name}</p>
                  {zone.description && (
                    <p className="text-xs text-gray-400">{zone.description}</p>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                  {zone.key}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1">
                    <span>৳</span>
                    <input
                      type="number"
                      min={0}
                      value={editingCharges[zone._id] ?? zone.charge}
                      onChange={(e) =>
                        setEditingCharges({
                          ...editingCharges,
                          [zone._id]: e.target.value,
                        })
                      }
                      onBlur={() => commitChargeEdit(zone._id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && commitChargeEdit(zone._id)
                      }
                      className="w-20 border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() =>
                      updateZone({ id: zone._id, isActive: !zone.isActive })
                    }
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      zone.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {zone.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => deleteZone(zone._id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  No shipping zones yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
