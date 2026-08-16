"use client";

import { useState } from "react";
import {
  useGetAllHomepageSectionsQuery,
  useCreateHomepageSectionMutation,
  useUpdateHomepageSectionMutation,
  useDeleteHomepageSectionMutation,
} from "../../../features/homepageSections/homepageSectionsApi";
import { useGetCategoriesQuery } from "../../../features/categories/categoriesApi";
import ProductPicker from "../../../components/admin/ProductPicker";
import ImageUploader from "../../../components/admin/ImageUploader";

const PROMO_OPTIONS = [
  { value: "isFeatured", label: "⭐ Featured" },
  { value: "isNewArrival", label: "✨ New Arrival" },
  { value: "isHotSale", label: "🔥 Hot Sale" },
  { value: "isFlashSale", label: "⚡ Flash Sale" },
];

const LAYOUT_OPTIONS = [
  { value: "grid", label: "Simple Grid" },
  { value: "featured", label: "Featured Collection (banner + grid)" },
  { value: "categories", label: "Category Showcase (shop by category)" },
  { value: "promo_banner", label: "Promo Banner (text announcement strip)" },
];

const emptyForm = {
  title: "",
  subtitle: "",
  sourceType: "promo",
  category: "",
  promoFlag: "isFeatured",
  products: [],
  limit: 8,
  sortOrder: 0,
  layout: "grid",
  banner: { image: null, title: "", subtitle: "", linkUrl: "" },
  categories: [],
  promoBanner: {
    image: null,
    heading: "",
    description: "",
    ctaLabel: "",
    ctaUrl: "",
    textTheme: "light",
  },
};

export default function AdminHomepageSectionsPage() {
  const { data, isLoading } = useGetAllHomepageSectionsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createSection, { isLoading: isCreating }] =
    useCreateHomepageSectionMutation();
  const [updateSection] = useUpdateHomepageSectionMutation();
  const [deleteSection] = useDeleteHomepageSectionMutation();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sections = data?.data || [];
  const categories = categoriesData?.data || [];

  const startEdit = (section) => {
    setEditingId(section._id);
    setForm({
      title: section.title,
      subtitle: section.subtitle || "",
      sourceType: section.sourceType || "promo",
      category: section.category?._id || "",
      promoFlag: section.promoFlag || "isFeatured",
      products: section.products || [],
      limit: section.limit,
      sortOrder: section.sortOrder,
      layout: section.layout || "grid",
      banner: section.banner || {
        image: null,
        title: "",
        subtitle: "",
        linkUrl: "",
      },
      categories: section.categories || [],
      promoBanner: section.promoBanner || {
        image: null,
        heading: "",
        description: "",
        ctaLabel: "",
        ctaUrl: "",
        textTheme: "light",
      },
    });
    setError("");
    setSuccess(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleCategory = (category) => {
    setForm((f) => {
      const exists = f.categories.some((c) => c._id === category._id);
      return {
        ...f,
        categories: exists
          ? f.categories.filter((c) => c._id !== category._id)
          : [...f.categories, category],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.layout === "featured" && !form.banner.image) {
      setError("Upload a banner image for a Featured Collection section.");
      return;
    }
    if (form.layout === "categories" && form.categories.length === 0) {
      setError("Select at least one category for a Category Showcase section.");
      return;
    }
    if (form.layout === "promo_banner" && !form.promoBanner.heading.trim()) {
      setError("Add a heading for the Promo Banner section.");
      return;
    }

    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      sortOrder: Number(form.sortOrder),
      layout: form.layout,
      ...(form.layout === "featured" && { banner: form.banner }),
      ...(form.layout === "categories" && {
        categories: form.categories.map((c) => c._id),
      }),
      ...(form.layout === "promo_banner" && { promoBanner: form.promoBanner }),
      ...(form.layout !== "categories" &&
        form.layout !== "promo_banner" && {
          sourceType: form.sourceType,
          limit: Number(form.limit),
          ...(form.sourceType === "category" && { category: form.category }),
          ...(form.sourceType === "promo" && { promoFlag: form.promoFlag }),
          ...(form.sourceType === "custom" && {
            products: form.products.map((p) => p._id),
          }),
        }),
    };

    try {
      if (editingId) {
        await updateSection({ id: editingId, ...payload }).unwrap();
      } else {
        await createSection(payload).unwrap();
      }
      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.data?.message || "Could not save this section.");
    }
  };

  const isProductBased =
    form.layout !== "categories" && form.layout !== "promo_banner";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Homepage Sections</h1>
      <p className="text-sm text-gray-500 mb-6">
        Build the storefront homepage — product rows, a catalog-style featured
        banner, a "shop by category" tile grid, or a text announcement strip.
        Order controls which appears first.
      </p>

      <form
        onSubmit={handleSubmit}
        className="border border-gray-100 rounded-xl p-4 mb-8 max-w-2xl space-y-4"
      >
        <h2 className="font-medium text-sm">
          {editingId ? "Edit Section" : "New Section"}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Section title (admin reference only, e.g. Men's Collection)"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Subtitle (optional)"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Layout</label>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, layout: opt.value })}
                className={`px-3 py-2 rounded-lg text-sm border ${
                  form.layout === opt.value
                    ? "border-brand-500 text-brand-500 bg-brand-50"
                    : "border-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {form.layout === "featured" && (
          <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-gray-50">
            <p className="text-xs text-gray-500">
              A large lifestyle image beside a product grid, like a catalog
              spread. Uses up to 7 products from your source below, plus a "View
              More" tile as the 8th cell.
            </p>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Banner Image
              </label>
              {form.banner.image?.url ? (
                <div className="relative w-40">
                  <img
                    src={form.banner.image.url}
                    alt=""
                    className="w-40 aspect-video object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        banner: { ...form.banner, image: null },
                      })
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border rounded-full text-red-500 text-xs shadow"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <ImageUploader
                  onUploaded={(img) =>
                    setForm({ ...form, banner: { ...form.banner, image: img } })
                  }
                  folder="homepage"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Banner title (e.g. Designer Polo)"
                value={form.banner.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    banner: { ...form.banner, title: e.target.value },
                  })
                }
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Banner subtitle (e.g. Premium Elegant Polo)"
                value={form.banner.subtitle}
                onChange={(e) =>
                  setForm({
                    ...form,
                    banner: { ...form.banner, subtitle: e.target.value },
                  })
                }
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <input
              placeholder="Link URL when banner/View More is clicked (optional — defaults to the category page)"
              value={form.banner.linkUrl}
              onChange={(e) =>
                setForm({
                  ...form,
                  banner: { ...form.banner, linkUrl: e.target.value },
                })
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        )}

        {form.layout === "categories" && (
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">
              Pick which categories to show as tiles. Add a banner image to each
              one under{" "}
              <a
                href="/admin/categories"
                target="_blank"
                className="text-brand-500 hover:underline"
              >
                Categories
              </a>{" "}
              for the best look — categories without one still show, just as a
              plain color tile.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <label
                  key={c._id}
                  className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.categories.some((sel) => sel._id === c._id)}
                    onChange={() => toggleCategory(c)}
                  />
                  {c.name}
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 col-span-2">
                  No categories yet.
                </p>
              )}
            </div>
          </div>
        )}

        {form.layout === "promo_banner" && (
          <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-gray-50">
            <p className="text-xs text-gray-500">
              A full-width text announcement — a headline, short description,
              and a button. Add a background image for a dark photo overlay, or
              leave it blank for a plain dark strip.
            </p>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Background Image (optional)
              </label>
              {form.promoBanner.image?.url ? (
                <div className="relative w-48">
                  <img
                    src={form.promoBanner.image.url}
                    alt=""
                    className="w-48 aspect-[16/5] object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        promoBanner: { ...form.promoBanner, image: null },
                      })
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border rounded-full text-red-500 text-xs shadow"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <ImageUploader
                  onUploaded={(img) =>
                    setForm({
                      ...form,
                      promoBanner: { ...form.promoBanner, image: img },
                    })
                  }
                  folder="homepage"
                />
              )}
            </div>

            <input
              placeholder="Heading (e.g. Appearance is a statement with 15% off)"
              required
              value={form.promoBanner.heading}
              onChange={(e) =>
                setForm({
                  ...form,
                  promoBanner: { ...form.promoBanner, heading: e.target.value },
                })
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              rows={2}
              value={form.promoBanner.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  promoBanner: {
                    ...form.promoBanner,
                    description: e.target.value,
                  },
                })
              }
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Button label (e.g. LEARN MORE)"
                value={form.promoBanner.ctaLabel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    promoBanner: {
                      ...form.promoBanner,
                      ctaLabel: e.target.value,
                    },
                  })
                }
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Button link (e.g. /products)"
                value={form.promoBanner.ctaUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    promoBanner: {
                      ...form.promoBanner,
                      ctaUrl: e.target.value,
                    },
                  })
                }
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Text Color
              </label>
              <div className="flex gap-2">
                {[
                  {
                    value: "light",
                    label: "Light text (for dark/photo backgrounds)",
                  },
                  { value: "dark", label: "Dark text (for light backgrounds)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        promoBanner: {
                          ...form.promoBanner,
                          textTheme: opt.value,
                        },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs border ${
                      form.promoBanner.textTheme === opt.value
                        ? "border-brand-500 text-brand-500 bg-brand-50"
                        : "border-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isProductBased && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                Show products from
              </label>
              <div className="flex gap-2">
                {[
                  { value: "category", label: "A Category" },
                  { value: "promo", label: "A Promo Flag" },
                  { value: "custom", label: "Custom Pick" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, sourceType: opt.value })}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      form.sourceType === opt.value
                        ? "border-brand-500 text-brand-500 bg-brand-50"
                        : "border-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.sourceType === "category" && (
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.sourceType === "promo" && (
              <div>
                <label className="text-sm font-medium">Promo Flag</label>
                <select
                  value={form.promoFlag}
                  onChange={(e) =>
                    setForm({ ...form, promoFlag: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                >
                  {PROMO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.sourceType === "custom" && (
              <div>
                <label className="text-sm font-medium block mb-2">
                  Products
                </label>
                <ProductPicker
                  selected={form.products}
                  onChange={(products) => setForm({ ...form, products })}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                Max products to show
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                className="w-24 border rounded px-3 py-2 text-sm mt-1"
              />
              {form.layout === "featured" && (
                <p className="text-xs text-gray-400 mt-1">
                  Only the first 7 are used in the grid; extras are ignored.
                </p>
              )}
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium">Position on page</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="w-24 border rounded px-3 py-2 text-sm mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">
            Lower numbers appear first.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">✓ Saved.</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isCreating}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isCreating
              ? "Saving..."
              : editingId
              ? "Save Changes"
              : "+ Add Section"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2.5 rounded-lg text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {sections.map((section) => (
            <div
              key={section._id}
              className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
            >
              <div>
                <p className="font-medium text-sm">
                  {section.title}
                  {section.layout === "featured" && (
                    <span className="ml-2 text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                  {section.layout === "categories" && (
                    <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                      Categories
                    </span>
                  )}
                  {section.layout === "promo_banner" && (
                    <span className="ml-2 text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded-full">
                      Promo Banner
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {section.layout === "categories" &&
                    `${section.categories?.length || 0} categor${
                      section.categories?.length === 1 ? "y" : "ies"
                    }`}
                  {section.layout === "promo_banner" &&
                    (section.promoBanner?.heading || "No heading set")}
                  {section.layout !== "categories" &&
                    section.layout !== "promo_banner" &&
                    section.sourceType === "category" &&
                    `Category: ${section.category?.name || "—"}`}
                  {section.layout !== "categories" &&
                    section.layout !== "promo_banner" &&
                    section.sourceType === "promo" &&
                    `Promo: ${
                      PROMO_OPTIONS.find((p) => p.value === section.promoFlag)
                        ?.label
                    }`}
                  {section.layout !== "categories" &&
                    section.layout !== "promo_banner" &&
                    section.sourceType === "custom" &&
                    `${section.products?.length || 0} hand-picked product(s)`}
                  {" · Position "}
                  {section.sortOrder}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateSection({
                      id: section._id,
                      isActive: !section.isActive,
                    })
                  }
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    section.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {section.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => startEdit(section)}
                  className="text-brand-500 hover:underline text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSection(section._id)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-gray-400">No homepage sections yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
