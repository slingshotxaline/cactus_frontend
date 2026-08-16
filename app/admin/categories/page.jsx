"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Search, Inbox, Loader2 } from "lucide-react";
import {
  useListAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../features/categories/categoriesApi";

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const emptyForm = { name: "", slug: "", description: "" };

// Deterministic accent color per category, derived from its name —
// keeps the row list scannable without needing real category icons.
const ACCENTS = [
  { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
  { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
  { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
];
const accentFor = (name = "") =>
  ACCENTS[name.charCodeAt(0) % ACCENTS.length] || ACCENTS[0];

export default function AdminCategoriesPage() {
  const { data, isLoading } = useListAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const allCategories = data?.data || [];
  const visibleByStatus = showAll
    ? allCategories
    : allCategories.filter((c) => c.isActive);
  const categories = query
    ? visibleByStatus.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : visibleByStatus;

  const activeCount = allCategories.filter((c) => c.isActive).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createCategory(form).unwrap();
      setForm(emptyForm);
    } catch (err) {
      setError(err?.data?.message || "Could not create category.");
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} active · {allCategories.length} total
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              !showAll
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              showAll
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            placeholder="Category name"
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: toSlug(e.target.value),
              })
            }
            className="md:col-span-4 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
          <input
            placeholder="slug-goes-here"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="md:col-span-3 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-600 placeholder:text-gray-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-3 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="md:col-span-2 inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium py-2.5 disabled:opacity-50 transition-colors"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isCreating ? "Adding" : "Add"}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-3 flex items-center gap-1.5">
            {error}
          </p>
        )}
      </form>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          placeholder="Search categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
        />
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {query
                ? "No categories match your search"
                : showAll
                ? "No categories yet"
                : "No active categories"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {query
                ? "Try a different search term."
                : "Add one using the form above."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-5 font-medium">Category</th>
                <th className="py-3 px-5 font-medium">Slug</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const accent = accentFor(c.name);
                return (
                  <tr
                    key={c._id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${accent.bg} ${accent.ring} ${accent.text}`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          {c.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                              {c.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {c.slug}
                      </code>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() =>
                          updateCategory({ id: c._id, isActive: !c.isActive })
                        }
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => deleteCategory(c._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Remove ${c.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
