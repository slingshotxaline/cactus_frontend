"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetProductBySlugQuery } from "../../../../features/products/productsApi";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../../../features/cart/cartSlice";
import { toggleCompare } from "../../../../features/compare/compareSlice";
import { recordView } from "../../../../features/recentlyViewed/recentlyViewedSlice";
import ReviewsSection from "../../../../components/shop/ReviewsSection";
import WishlistButton from "../../../../components/shop/WishlistButton";
import ProductCarousel from "../../../../components/shop/ProductCarousel";
import {
  useGetSimilarProductsQuery,
  useGetFrequentlyBoughtTogetherQuery,
} from "../../../../features/recommendations/recommendationsApi";
import RecentlyViewedCarousel from "../../../../components/shop/RecentlyViewedCarousel";
import {
  getEffectivePrice,
  getStrikethroughPrice,
  getProductImage,
} from "../../../../utils/pricing";

import Image from "next/image";

const BADGES = [
  { key: "isFlashSale", label: "⚡ Flash Sale", className: "bg-red-500" },
  { key: "isHotSale", label: "🔥 Hot Sale", className: "bg-orange-500" },
  { key: "isNewArrival", label: "✨ New Arrival", className: "bg-blue-500" },
];

// NOTE: this assumes each variant looks like:
//   { _id, sku, stock, price, compareAtPrice, attributes: { size: "M", color: "Pink" } }
// If your attribute keys differ, adjust SIZE_KEY / COLOR_KEY below.
const SIZE_KEY = "size";
const COLOR_KEY = "color";

function Stars({ value = 0 }) {
  const rounded = Math.round(value);
  return (
    <span className="text-amber-400 text-sm leading-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= rounded ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function ProductDetailPage({ params }) {
  const { data, isLoading, isError } = useGetProductBySlugQuery(params.slug);
  const dispatch = useDispatch();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [descExpanded, setDescExpanded] = useState(false);

  const compareItems = useSelector((state) => state.compare.items);

  const { data: similarData } = useGetSimilarProductsQuery(data?.data?._id, {
    skip: !data?.data,
  });
  const { data: fbtData } = useGetFrequentlyBoughtTogetherQuery(
    data?.data?._id,
    { skip: !data?.data }
  );

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      dispatch(
        recordView({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          basePrice: p.basePrice,
          offerPrice: p.offerPrice,
          specialPrice: p.specialPrice,
          oldPrice: p.oldPrice,
          baseImage: p.baseImage,
          images: p.images,
          ratingsAverage: p.ratingsAverage,
        })
      );
      setActiveImage(getProductImage(p));

      if (p.hasVariants && p.variants?.length > 0) {
        const first = p.variants.find((v) => v.stock > 0) || p.variants[0];
        const firstSizes = (first.attributes?.[SIZE_KEY] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setSelectedColor(first.attributes?.[COLOR_KEY] || null);
        setSelectedSize(firstSizes[0] || null);
      }
    }
  }, [data, dispatch]);

  const product = data?.data;

  // Each variant = one color, with its sizes stored as a comma-separated
  // string (e.g. "M,L,XL,XXL") and one stock/price shared across those sizes.
  // Picking a color selects the variant; sizes just describe what that
  // variant is available in and don't carry their own stock.
  const { sizes, colors, selectedVariant } = useMemo(() => {
    if (!product?.hasVariants || !product?.variants?.length) {
      return { sizes: [], colors: [], selectedVariant: null };
    }
    const colorSet = [];
    product.variants.forEach((v) => {
      const c = v.attributes?.[COLOR_KEY];
      if (c && !colorSet.includes(c)) colorSet.push(c);
    });
    const match =
      product.variants.find(
        (v) =>
          colorSet.length === 0 || v.attributes?.[COLOR_KEY] === selectedColor
      ) || product.variants[0];
    const sizeList = (match?.attributes?.[SIZE_KEY] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return { sizes: sizeList, colors: colorSet, selectedVariant: match };
  }, [product, selectedColor]);

  // Keep the selected size valid whenever the color (and its size list) changes
  useEffect(() => {
    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize]);

  if (isLoading)
    return <div className="max-w-6xl mx-auto px-4 py-16">Loading...</div>;
  if (isError || !product)
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">Product not found.</div>
    );

  const displayPrice = selectedVariant?.price ?? getEffectivePrice(product);
  const strikethrough = selectedVariant
    ? selectedVariant.compareAtPrice
    : getStrikethroughPrice(product);
  const stockForSelection = selectedVariant
    ? selectedVariant.stock
    : product.stock;
  const inStock = stockForSelection > 0;
  const isComparing = compareItems.some((p) => p._id === product._id);
  const badge = BADGES.find((b) => product[b.key]);
  const gallery = [product.baseImage, ...(product.images || [])].filter(
    (img) => img?.url
  );
  const activeIndex = Math.max(
    0,
    gallery.findIndex((g) => g.url === activeImage)
  );
  const savings =
    strikethrough && strikethrough > displayPrice
      ? strikethrough - displayPrice
      : 0;
  const discountPct = strikethrough
    ? Math.round((savings / strikethrough) * 100)
    : 0;
  const reviewCount = product.ratingsQuantity ?? product.reviewCount ?? 0;

  const showPrev = () =>
    setActiveImage(
      gallery[(activeIndex - 1 + gallery.length) % gallery.length].url
    );
  const showNext = () =>
    setActiveImage(gallery[(activeIndex + 1) % gallery.length].url);

  const buildCartItem = () => ({
    productId: product._id,
    variantId: selectedVariant?._id || null,
    title: product.title,
    color: product.hasVariants ? selectedColor || null : null,
    size: product.hasVariants ? selectedSize || null : null,
    sku: selectedVariant?.sku || null,
    price: displayPrice,
    image: getProductImage(product),
    quantity,
  });

  const handleAddToCart = () => {
    if (product.hasVariants && !selectedVariant) return;
    dispatch(addItem(buildCartItem()));
  };

  const handleBuyNow = () => {
    if (product.hasVariants && !selectedVariant) return;
    dispatch(addItem(buildCartItem()));
    router.push("/cart");
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      icon: "f",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(product.title)}`,
      icon: "𝕏",
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        shareUrl
      )}&media=${encodeURIComponent(getProductImage(product) || "")}`,
      icon: "p",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
      icon: "t",
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(
        product.title
      )}&body=${encodeURIComponent(shareUrl)}`,
      icon: "✉",
    },
  ];

  const TABS = [
    { key: "description", label: "Size Chart and Description" },
    { key: "additional", label: "Additional Information" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="flex gap-3">
          {gallery.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === img.url
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.title} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden">
            {badge && (
              <span
                className={`absolute top-3 left-3 z-10 text-white text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}
              >
                {badge.label}
              </span>
            )}
            {discountPct > 0 && (
              <span className="absolute top-3 right-3 z-10 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                -{discountPct}%
              </span>
            )}

            {activeImage && (
              <Image
                src={activeImage}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}

            {gallery.length > 1 && (
              <>
                <button
                  onClick={showPrev}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700"
                >
                  ‹
                </button>
                <button
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700"
                >
                  ›
                </button>
              </>
            )}

            <button
              aria-label="Expand image"
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700"
            >
              ⤢
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

          {product.shortDescription && (
            <p className="text-gray-500 mt-2">
              {descExpanded
                ? product.shortDescription
                : `${product.shortDescription.slice(0, 110)}${
                    product.shortDescription.length > 110 ? "…" : ""
                  }`}{" "}
              {product.shortDescription.length > 110 && (
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  className="text-gray-900 underline underline-offset-2 text-sm"
                >
                  {descExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {strikethrough > displayPrice && (
              <p className="text-gray-400 line-through text-sm">
                ৳{strikethrough.toLocaleString()}
              </p>
            )}
            <p className="text-red-600 text-xl font-bold">
              ৳{displayPrice.toLocaleString()}
            </p>
            {savings > 0 && (
              <span className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded">
                SAVE ৳{savings.toLocaleString()}
              </span>
            )}
            {reviewCount > 0 && (
              <button
                onClick={() => setActiveTab("reviews")}
                className="flex items-center gap-1 text-sm text-gray-600"
              >
                <Stars value={product.ratingsAverage} />
                {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </button>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="mt-5">
              <label className="text-sm font-semibold text-gray-800 block mb-2">
                SIZE: <span className="font-normal">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={!inStock}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg border text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:line-through ${
                      selectedSize === s
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-5">
              <label className="text-sm font-semibold text-gray-800 block mb-2">
                COLOR: <span className="font-normal">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    title={c}
                    style={{ backgroundColor: c.toLowerCase() }}
                    className={`w-8 h-8 rounded-md border-2 ${
                      selectedColor === c
                        ? "border-gray-900 ring-2 ring-offset-2 ring-gray-900"
                        : "border-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {!inStock && (
            <p className="text-sm text-red-500 mt-4">Out of stock</p>
          )}

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                −
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    stockForSelection
                      ? Math.min(stockForSelection, q + 1)
                      : q + 1
                  )
                }
                className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add To Cart
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="w-full mt-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Buy It Now
          </button>

          <div className="flex items-center gap-3 mt-3">
            <WishlistButton productId={product._id} />
            <button
              onClick={() =>
                dispatch(
                  toggleCompare({
                    _id: product._id,
                    title: product.title,
                    slug: product.slug,
                    basePrice: product.basePrice,
                    images: product.images,
                    ratingsAverage: product.ratingsAverage,
                  })
                )
              }
              className={`border rounded-lg px-4 py-2 text-sm font-medium ${
                isComparing
                  ? "border-gray-900 text-gray-900 bg-gray-100"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {isComparing ? "Remove from Compare" : "+ Compare"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600 space-y-1">
            {selectedVariant?.sku && (
              <p>
                SKU:{" "}
                <span className="text-gray-800">{selectedVariant.sku}</span>
              </p>
            )}
            <p>
              Availability:{" "}
              <span className={inStock ? "text-green-600" : "text-red-500"}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {shareLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${s.label}`}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 text-sm"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex justify-center gap-2 border-b border-gray-200 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-full -mb-px border ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-8 max-w-3xl mx-auto">
          {activeTab === "description" && (
            <div className="prose prose-sm max-w-none text-gray-600">
              {product.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p>{product.shortDescription}</p>
              )}
            </div>
          )}

          {activeTab === "additional" && (
            <table className="w-full text-sm">
              <tbody>
                {sizes.length > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-700 w-40">
                      Size
                    </td>
                    <td className="py-3 text-gray-600">{sizes.join(", ")}</td>
                  </tr>
                )}
                {colors.length > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-700 w-40">
                      Color
                    </td>
                    <td className="py-3 text-gray-600">{colors.join(", ")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "reviews" && (
            <ReviewsSection productId={product._id} />
          )}
        </div>
      </div>

      <ProductCarousel
        title="Frequently Bought Together"
        products={fbtData?.data}
      />
      <ProductCarousel title="Similar Products" products={similarData?.data} />
      <RecentlyViewedCarousel excludeId={product._id} />
    </div>
  );
}
