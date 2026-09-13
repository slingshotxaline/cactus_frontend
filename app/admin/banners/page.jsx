"use client";

import { useState } from "react";
import {
  useListBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useRestoreBannerMutation,
} from "../../../features/cms/pagesApi";
import ImageUploader from "../../../components/admin/ImageUploader";

const emptyForm = { title: "", image: null, linkUrl: "", placement: "homepage_hero", sortOrder: 0 };

const PLACEMENTS = [
  { value: "homepage_hero", label: "Homepage Hero" },
  { value: "category_top", label: "Category Top" },
  { value: "sidebar", label: "Sidebar" },
];

export default function AdminBannersPage() {
  const { data, isLoading } = useListBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [restoreBanner] = useRestoreBannerMutation();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [showInactive, setShowInactive] = useState(true);

  const allBanners = [...(data?.data || [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const banners = showInactive ? allBanners : allBanners.filter((b) => b.isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.image) {
      setError("Please upload an image before adding the banner.");
      return;
    }

    try {
      await createBanner(form).unwrap();
      setForm(emptyForm);
      setSuccessMsg("Banner added successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err?.data?.message || "Could not create banner. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteBanner(id).unwrap();
    } catch {
      setError("Could not remove this banner. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      await restoreBanner(id).unwrap();
    } catch {
      setError("Could not restore this banner. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Banners</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage promotional banners shown across the site.
      </p>

      <form
        onSubmit={handleSubmit}
        className="border border-gray-100 rounded-xl p-5 mb-8 space-y-4 max-w-md bg-white shadow-sm"
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Banner image <span className="text-red-500">*</span>
          </label>
          <ImageUploader onUploaded={(img) => setForm({ ...form, image: img })} folder="banners" />
          {form.image && <p className="text-xs text-green-600 mt-1">Image uploaded ✓</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            placeholder="e.g. Summer Sale"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
          <input
            placeholder="https://example.com/sale"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Placement</label>
            <select
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        <button
          type="submit"
          disabled={isCreating}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {isCreating ? "Saving..." : "Add Banner"}
        </button>
      </form>

      <div className="flex items-center justify-between mb-4 max-w-3xl">
        <h2 className="text-sm font-semibold text-gray-700">
          All Banners {!isLoading && <span className="text-gray-400 font-normal">({banners.length})</span>}
        </h2>
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300"
          />
          Show inactive
        </label>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden animate-pulse">
              <div className="w-full aspect-video bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
          No banners yet. Add your first one above.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div
              key={b._id}
              className={`border rounded-xl overflow-hidden bg-white shadow-sm ${
                b.isActive ? "border-gray-100" : "border-red-100 opacity-70"
              }`}
            >
              <img
                src={b.image?.url}
                alt={b.title || "Banner"}
                className="w-96 aspect-video object-cover bg-gray-50"
              />
              <div className="p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{b.title || "Untitled"}</p>
                  <p className="text-xs text-gray-400">
                    {PLACEMENTS.find((p) => p.value === b.placement)?.label || b.placement}
                    {typeof b.sortOrder === "number" && ` · Order ${b.sortOrder}`}
                    {!b.isActive && <span className="text-red-400"> · Inactive</span>}
                  </p>
                  {b.linkUrl && (
                    <a
                      href={b.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-500 hover:underline block truncate mt-1"
                    >
                      {b.linkUrl}
                    </a>
                  )}
                </div>

                <div className="mt-3">
                  {b.isActive ? (
                    confirmingId === b._id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Remove this banner?</span>
                        <button
                          onClick={() => handleDelete(b._id)}
                          disabled={deletingId === b._id}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded disabled:opacity-50"
                        >
                          {deletingId === b._id ? "Removing..." : "Yes, remove"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(b._id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleRestore(b._id)}
                      disabled={restoringId === b._id}
                      className="text-xs text-green-600 hover:underline disabled:opacity-50"
                    >
                      {restoringId === b._id ? "Restoring..." : "Restore"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}