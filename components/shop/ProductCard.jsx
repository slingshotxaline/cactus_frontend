import Link from "next/link";
import {
  getEffectivePrice,
  getStrikethroughPrice,
  getProductImage,
} from "../../utils/pricing";
import Image from "next/image";
import { trackClick } from "../../lib/tracking";

const BADGES = [
  { key: "isFlashSale", label: "⚡ Flash Sale", className: "bg-red-500" },
  { key: "isHotSale", label: "🔥 Hot Sale", className: "bg-orange-500" },
  { key: "isNewArrival", label: "✨ New", className: "bg-black" },
];

export default function ProductCard({ product }) {
  const image = getProductImage(product);
  const price = getEffectivePrice(product);
  const strikethrough = getStrikethroughPrice(product);
  const badge = BADGES.find((b) => product[b.key]);

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={() => trackClick(`product_card:${product.slug}`)}
      className="group block  overflow-hidden relative"
    >
      {badge && (
        <span
          className={`absolute z-10 text-white text-[10px] font-medium px-2 py-3  ${badge.className}`}
        >
          {badge.label}
        </span>
      )}
      
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-black font-semibold">
            ৳{price.toLocaleString()}
          </p>
          {strikethrough && (
            <p className="text-gray-400 text-xs line-through">
              ৳{strikethrough.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
