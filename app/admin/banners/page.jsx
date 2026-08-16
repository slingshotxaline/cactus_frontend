"use client";

import { useState } from "react";
import { useListBannersQuery, useCreateBannerMutation, useDeleteBannerMutation } from "../../../features/cms/pagesApi";
import ImageUploader from "../../../components/admin/ImageUploader";

const emptyForm = { title: "", image: null, linkUrl: "", placement: "homepage_hero", sortOrder: 0 };

export default function AdminBannersPage() {
  const { data, isLoading } = useListBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const banners = data?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.image) return setError("Upload an image first.");
    try {
      await createBanner(form).unwrap();
      setForm(emptyForm);
    } catch (err) {
      setError(err?.data?.message || "Could not create banner.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>

      <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4 mb-8 space-y-3 max-w-md">
        <ImageUploader onUploaded={(img) => setForm({ ...form, image: img })} folder="banners" />
        <input
          placeholder="Title (optional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Link URL"
          value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <select
          value={form.placement}
          onChange={(e) => setForm({ ...form, placement: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="homepage_hero">Homepage Hero</option>
          <option value="category_top">Category Top</option>
          <option value="sidebar">Sidebar</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isCreating} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          {isCreating ? "Saving..." : "Add Banner"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b._id} className="border border-gray-100 rounded-xl overflow-hidden">
              <img src={b.image?.url} alt={b.title} className="w-full aspect-video object-cover" />
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{b.title || "Untitled"}</p>
                  <p className="text-xs text-gray-400">{b.placement}</p>
                </div>
                <button onClick={() => deleteBanner(b._id)} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-gray-400 col-span-3">No banners yet.</p>}
        </div>
      )}
    </div>
  );
}
