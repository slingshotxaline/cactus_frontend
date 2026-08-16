"use client";

import { useSelector, useDispatch } from "react-redux";
import { toggleCompare, clearCompare } from "../../../features/compare/compareSlice";

export default function ComparePage() {
  const items = useSelector((state) => state.compare.items);
  const dispatch = useDispatch();

  if (!items.length)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        No products selected. Add up to 4 products to compare from any product page.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Compare Products</h1>
        <button onClick={() => dispatch(clearCompare())} className="text-sm text-gray-400 hover:text-red-500">
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr>
              <td className="w-32"></td>
              {items.map((p) => (
                <td key={p._id} className="p-3 text-center align-top">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden w-32 mx-auto mb-2">
                    {p.images?.[0]?.url && (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="font-medium">{p.title}</p>
                  <button
                    onClick={() => dispatch(toggleCompare(p))}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-100">
              <td className="py-3 font-medium text-gray-500">Price</td>
              {items.map((p) => (
                <td key={p._id} className="py-3 text-center text-brand-500 font-semibold">
                  ৳{p.basePrice?.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr className="border-t border-gray-100">
              <td className="py-3 font-medium text-gray-500">Rating</td>
              {items.map((p) => (
                <td key={p._id} className="py-3 text-center">
                  {p.ratingsAverage ? `${p.ratingsAverage.toFixed(1)} ★` : "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
