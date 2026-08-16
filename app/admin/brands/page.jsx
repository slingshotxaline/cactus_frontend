"use client";

import { useState } from "react";
import {
  useListAllBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "../../../features/brands/brandsApi";
import ImageUploader from "../../../components/admin/ImageUploader";

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const emptyForm = { name: "", slug: "", logo: null };

export default function AdminBrandsPage() {
  const { data, isLoading } = useListAllBrandsQuery();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const brands = data?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createBrand(form).unwrap();
      setForm(emptyForm);
    } catch (err) {
      setError(err?.data?.message || "Could not create brand.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Brands</h1>

      <form
        onSubmit={handleSubmit}
        className="border border-gray-100 rounded-xl p-4 mb-8 flex gap-4 items-start"
      >
        <ImageUploader
          onUploaded={(img) => setForm({ ...form, logo: img })}
          folder="brands"
        />
        <div className="flex-1 grid grid-cols-2 gap-3">
          <input
            placeholder="Brand name"
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: toSlug(e.target.value),
              })
            }
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="col-span-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium py-2"
          >
            {isCreating ? "Adding..." : "+ Add Brand"}
          </button>
          {error && <p className="text-sm text-red-600 col-span-2">{error}</p>}
        </div>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {brands.map((b) => (
            <div
              key={b._id}
              className="border border-gray-100 rounded-xl p-4 flex items-center gap-3"
            >
              {b.logo?.url ? (
                <img
                  src={b.logo.url}
                  alt={b.name}
                  className="w-12 h-12 object-contain rounded"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{b.name}</p>
                <button
                  onClick={() =>
                    updateBrand({ id: b._id, isActive: !b.isActive })
                  }
                  className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    b.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {b.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <button
                onClick={() => deleteBrand(b._id)}
                className="text-red-500 hover:underline text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          {brands.length === 0 && (
            <p className="text-gray-400 col-span-3">No brands yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
