"use client";

import { useState } from "react";
import { useGetProductsQuery } from "../../features/products/productsApi";
import { getProductImage } from "../../utils/pricing";

// Search-and-add product picker for "custom" homepage sections. Keeps the
// full product objects (not just ids) in `selected` so the parent form can
// render titles/images without a second lookup — only the ids get sent to
// the backend on save.
export default function ProductPicker({ selected, onChange }) {
  const [search, setSearch] = useState("");
  const { data, isFetching } = useGetProductsQuery(
    { search: search || undefined, limit: 8 },
    { skip: !search }
  );

  const results = (data?.data || []).filter(
    (p) => !selected.some((s) => s._id === p._id)
  );

  const addProduct = (product) => onChange([...selected, product]);
  const removeProduct = (id) => onChange(selected.filter((p) => p._id !== id));
  const move = (index, direction) => {
    const next = [...selected];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    onChange(next);
  };

  return (
    <div>
      <input
        placeholder="Search products to add..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />

      {search && (
        <div className="border rounded-lg mt-1 max-h-48 overflow-y-auto">
          {isFetching ? (
            <p className="text-xs text-gray-400 p-2">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-gray-400 p-2">No matches.</p>
          ) : (
            results.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => addProduct(p)}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left text-sm"
              >
                {getProductImage(p) && (
                  <img
                    src={getProductImage(p)}
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                {p.title}
              </button>
            ))
          )}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {selected.map((p, i) => (
          <div
            key={p._id}
            className="flex items-center gap-2 border rounded-lg p-2"
          >
            {getProductImage(p) && (
              <img
                src={getProductImage(p)}
                alt=""
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <span className="flex-1 text-sm">{p.title}</span>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-gray-400 disabled:opacity-30 px-1"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === selected.length - 1}
              className="text-gray-400 disabled:opacity-30 px-1"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeProduct(p._id)}
              className="text-red-500 text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}
        {selected.length === 0 && (
          <p className="text-xs text-gray-400">
            No products added yet — search above.
          </p>
        )}
      </div>
    </div>
  );
}
