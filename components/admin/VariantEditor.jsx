"use client";

// Manages an array of { sku, attributes: {color, size, ...}, price, stock }.
// attributes is stored as a flat object here and converted to a Map server-side
// by Mongoose automatically since Product.variants[].attributes is typed as Map.
const emptyVariant = () => ({ sku: "", attributes: { color: "", size: "" }, price: "", stock: "" });

export default function VariantEditor({ variants, onChange }) {
  const updateVariant = (index, patch) => {
    const next = variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(next);
  };

  const updateAttribute = (index, key, value) => {
    const next = variants.map((v, i) =>
      i === index ? { ...v, attributes: { ...v.attributes, [key]: value } } : v
    );
    onChange(next);
  };

  const addVariant = () => onChange([...variants, emptyVariant()]);
  const removeVariant = (index) => onChange(variants.filter((_, i) => i !== index));

  return (
    <div>
      <label className="text-sm font-medium block mb-2">Variants</label>
      <div className="space-y-3">
        {variants.map((variant, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 grid grid-cols-2 md:grid-cols-5 gap-2 items-start">
            <input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) => updateVariant(i, { sku: e.target.value })}
              className="border rounded px-2 py-1.5 text-sm"
            />
            <input
              placeholder="Color"
              value={variant.attributes?.color || ""}
              onChange={(e) => updateAttribute(i, "color", e.target.value)}
              className="border rounded px-2 py-1.5 text-sm"
            />
            <input
              placeholder="Size"
              value={variant.attributes?.size || ""}
              onChange={(e) => updateAttribute(i, "size", e.target.value)}
              className="border rounded px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="Price"
              value={variant.price}
              onChange={(e) => updateVariant(i, { price: e.target.value })}
              className="border rounded px-2 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => updateVariant(i, { stock: e.target.value })}
                className="border rounded px-2 py-1.5 text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-red-500 text-sm px-2"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addVariant}
        className="mt-3 text-sm text-brand-500 hover:underline"
      >
        + Add Variant
      </button>
    </div>
  );
}
