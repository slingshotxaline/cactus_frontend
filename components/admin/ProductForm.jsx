"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  Tag,
  Banknote,
  Boxes,
  FileText,
  ImagePlus,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Flame,
  Zap,
  Star as StarIcon,
} from "lucide-react";
import { useGetCategoriesQuery } from "../../features/categories/categoriesApi";
import { useGetBrandsQuery } from "../../features/brands/brandsApi";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../features/products/productsApi";
import ImageUploader from "./ImageUploader";
import VariantEditor from "./VariantEditor";
import RichTextEditor from "./RichTextEditor";

const toSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const PROMOTIONS = [
  {
    key: "isHotSale",
    label: "Hot Sale",
    icon: Flame,
    classes: "border-orange-100 bg-orange-50 text-orange-600",
  },
  {
    key: "isNewArrival",
    label: "New Arrival",
    icon: Sparkles,
    classes: "border-blue-100 bg-blue-50 text-blue-600",
  },
  {
    key: "isFlashSale",
    label: "Flash Sale",
    icon: Zap,
    classes: "border-red-100 bg-red-50 text-red-600",
  },
  {
    key: "isFeatured",
    label: "Featured",
    icon: StarIcon,
    classes: "border-violet-100 bg-violet-50 text-violet-600",
  },
];

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";
const labelClasses = "text-sm font-medium text-gray-700";
const hintClasses = "mt-1.5 text-xs text-gray-400";

function Card({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <Icon className="h-4.5 w-4.5 text-gray-500" />
        </div>
        <div>
          <h2 className="font-medium text-gray-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="font-medium text-gray-700">{label}</span>
    </label>
  );
}

export default function ProductForm({ initialProduct }) {
  const router = useRouter();
  const isEditing = !!initialProduct;
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [form, setForm] = useState({
    title: initialProduct?.title || "",
    slug: initialProduct?.slug || "",
    category: initialProduct?.category?._id || "",
    // brand: initialProduct?.brand?._id || "",

    oldPrice: initialProduct?.oldPrice || "",
    basePrice: initialProduct?.basePrice || "",
    offerPrice: initialProduct?.offerPrice || "",
    specialPrice: initialProduct?.specialPrice || "",

    stock: initialProduct?.stock || 0,
    shortDescription: initialProduct?.shortDescription || "",
    description: initialProduct?.description || "",
    baseImage: initialProduct?.baseImage || null,
    images: initialProduct?.images || [],
    hasVariants: initialProduct?.hasVariants || false,
    variants: initialProduct?.variants || [],

    isHotSale: initialProduct?.isHotSale || false,
    isNewArrival: initialProduct?.isNewArrival || false,
    isFlashSale: initialProduct?.isFlashSale || false,
    isFeatured: initialProduct?.isFeatured || false,
  });
  const [error, setError] = useState("");

  const categories = categoriesData?.data || [];
  // const brands = brandsData?.data || [];
  const isSaving = isCreating || isUpdating;

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: isEditing ? f.slug : toSlug(title) }));
  };

  const addGalleryImage = (image) => {
    setForm((f) => ({ ...f, images: [...f.images, image] }));
  };

  const removeGalleryImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const moveGalleryImage = (index, direction) => {
    setForm((f) => {
      const next = [...f.images];
      const swapWith = index + direction;
      if (swapWith < 0 || swapWith >= next.length) return f;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...f, images: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.baseImage) return setError("Upload a base image before saving.");
    if (form.hasVariants && form.variants.length === 0) {
      return setError('Add at least one variant, or turn off "Has variants".');
    }

    try {
      const payload = {
        ...form,
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        basePrice: Number(form.basePrice),
        offerPrice: form.offerPrice ? Number(form.offerPrice) : undefined,
        specialPrice: form.specialPrice ? Number(form.specialPrice) : undefined,
        stock: Number(form.stock),
        variants: form.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock),
        })),
      };
      if (isEditing) {
        await updateProduct({ id: initialProduct._id, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err?.data?.message || "Could not save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card icon={Info} title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. Classic Cotton T-Shirt"
                />
              </div>
              <div>
                <label className={labelClasses}>Slug</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={`${inputClasses} font-mono text-xs`}
                />
                <p className={hintClasses}>Used in the product URL.</p>
              </div>
            </div>
          </Card>

          <Card
            icon={Tag}
            title="Organization"
            description="Where this product appears in your catalog."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={inputClasses}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className={hintClasses}>
                  Don't see it?{" "}
                  <a
                    href="/admin/categories"
                    target="_blank"
                    className="text-brand-500 hover:underline"
                  >
                    Add one
                  </a>
                  .
                </p>
              </div>
              {/* <div>
                <label className={labelClasses}>Brand</label>
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">No brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <p className={hintClasses}>
                  Don't see it?{" "}
                  <a
                    href="/admin/brands"
                    target="_blank"
                    className="text-brand-500 hover:underline"
                  >
                    Add one
                  </a>
                  .
                </p>
              </div> */}
            </div>
          </Card>

          <Card
            icon={Banknote}
            title="Pricing"
            description="Special price beats offer price, which beats base price."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>Old Price (৳)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. original / MRP"
                  value={form.oldPrice}
                  onChange={(e) =>
                    setForm({ ...form, oldPrice: e.target.value })
                  }
                  className={inputClasses}
                />
                <p className={hintClasses}>Shown struck through, optional.</p>
              </div>
              <div>
                <label className={labelClasses}>Base Price (৳) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: e.target.value })
                  }
                  className={inputClasses}
                />
                <p className={hintClasses}>The regular selling price.</p>
              </div>
              <div>
                <label className={labelClasses}>Offer Price (৳)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Standing discount"
                  value={form.offerPrice}
                  onChange={(e) =>
                    setForm({ ...form, offerPrice: e.target.value })
                  }
                  className={inputClasses}
                />
                <p className={hintClasses}>Overrides Base Price if set.</p>
              </div>
              <div>
                <label className={labelClasses}>Special Price (৳)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Optional — e.g. flash sale"
                  value={form.specialPrice}
                  onChange={(e) =>
                    setForm({ ...form, specialPrice: e.target.value })
                  }
                  className={inputClasses}
                />
                <p className={hintClasses}>Overrides everything else if set.</p>
              </div>
            </div>
          </Card>

          <Card icon={Boxes} title="Inventory">
            <Toggle
              checked={form.hasVariants}
              onChange={(v) => setForm({ ...form, hasVariants: v })}
              label="This product has variants (size, color, etc.)"
            />
            <div className="mt-4">
              {form.hasVariants ? (
                <VariantEditor
                  variants={form.variants}
                  onChange={(variants) => setForm({ ...form, variants })}
                />
              ) : (
                <div className="max-w-xs">
                  <label className={labelClasses}>Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className={inputClasses}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card icon={FileText} title="Description">
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Short Description</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm({ ...form, shortDescription: e.target.value })
                  }
                  className={inputClasses}
                  placeholder="One line shown in listings"
                />
              </div>
              <div>
                <label className={`${labelClasses} mb-1.5 block`}>
                  Full Description *
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(description) => setForm({ ...form, description })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card
            icon={ImagePlus}
            title="Base Image"
            description="Main photo — used in listings and cards."
          >
            {form.baseImage?.url ? (
              <div className="group relative aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border border-gray-100">
                <img
                  src={form.baseImage.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, baseImage: null })}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition-transform hover:scale-110"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <ImageUploader
                onUploaded={(img) => setForm({ ...form, baseImage: img })}
                folder="products"
              />
            )}
          </Card>

          <Card
            icon={ImagePlus}
            title="Additional Images"
            description="First image shows first in the gallery."
          >
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-100"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-red-500 shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/40 to-transparent px-1 pb-1 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => moveGalleryImage(i, -1)}
                      disabled={i === 0}
                      className="flex h-5 w-5 items-center justify-center rounded bg-white/90 text-gray-700 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveGalleryImage(i, 1)}
                      disabled={i === form.images.length - 1}
                      className="flex h-5 w-5 items-center justify-center rounded bg-white/90 text-gray-700 disabled:opacity-30"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="h-20 w-20">
                <ImageUploader
                  onUploaded={addGalleryImage}
                  folder="products"
                  compact
                />
              </div>
            </div>
          </Card>

          <Card
            icon={Sparkles}
            title="Promotions"
            description="Where this product gets extra visibility."
          >
            <div className="grid grid-cols-2 gap-2">
              {PROMOTIONS.map(({ key, label, icon: Icon, classes }) => {
                const active = form[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, [key]: !active })}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all ${
                      active
                        ? classes
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${active ? "" : "text-gray-300"}`}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white/90 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          {error ? (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : (
            <span className="text-xs text-gray-400">
              {isEditing
                ? "Editing existing product"
                : "Creating a new product"}
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Product"}
          </button>
        </div>
      </div>
    </form>
  );
}
