"use client";

import { useState } from "react";
import { useAdjustStockMutation } from "../../features/inventory/inventoryApi";

const TYPE_LABELS = {
  purchase: "Purchase (new stock received)",
  incoming: "Incoming (in transit from supplier)",
  damaged: "Damaged",
  adjustment: "Manual Adjustment (correction)",
};

export default function StockAdjustModal({ row, onClose }) {
  const [adjustStock, { isLoading }] = useAdjustStockMutation();
  const [type, setType] = useState("purchase");
  const [quantity, setQuantity] = useState(1);
  const [direction, setDirection] = useState("add"); // add | remove
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const quantityChange = direction === "add" ? Math.abs(Number(quantity)) : -Math.abs(Number(quantity));
    try {
      await adjustStock({
        productId: row.product._id,
        variantId: row.variantId,
        type,
        quantityChange,
        reason,
      }).unwrap();
      onClose();
    } catch (err) {
      setError(err?.data?.message || "Could not adjust stock.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-lg mb-1">Adjust Stock</h2>
        <p className="text-sm text-gray-500 mb-4">
          {row.product.title}{row.variantLabel ? ` — ${row.variantLabel}` : ""}
          <br />Current: <span className="font-medium text-gray-900">{row.currentStock}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection("add")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${direction === "add" ? "border-green-500 text-green-600 bg-green-50" : "border-gray-200"}`}
            >
              + Add
            </button>
            <button
              type="button"
              onClick={() => setDirection("remove")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${direction === "remove" ? "border-red-500 text-red-600 bg-red-50" : "border-gray-200"}`}
            >
              − Remove
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Quantity</label>
            <input
              type="number" min={1} required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1">
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Reason / Reference</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. PO #1234, damaged in warehouse"
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}