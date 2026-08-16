"use client";

import Link from "next/link";
import {
  getEffectivePrice,
  getStrikethroughPrice,
  getProductImage,
} from "../../utils/pricing";

export default function FeaturedCollectionSection({ section }) {
  const { title, subtitle, banner, products, category } = section;
  const viewMoreLink =
    banner?.linkUrl ||
    (category ? `/products?category=${category._id || category}` : "/products");

  const gridProducts = products.slice(0, 7);
  const overflowProduct = products[7];

  return (
    <section className="mb-14">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-[320px_repeat(4,1fr)] md:grid-rows-2 gap-3">
        {banner?.image?.url && (
          <Link
            href={viewMoreLink}
            className="col-span-2 md:col-span-1 md:row-span-2 relative rounded-lg overflow-hidden group block"
          >
            <img
              src={banner.image.url}
              alt={banner.title || title}
              className="w-full h-full object-cover aspect-[16/10] md:aspect-auto group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              {banner.subtitle && (
                <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                  {banner.subtitle}
                </p>
              )}
              {banner.title && (
                <h3 className="text-2xl font-bold leading-tight">
                  {banner.title}
                </h3>
              )}
            </div>
          </Link>
        )}

        {gridProducts.map((product) => (
          <FeaturedTile key={product._id} product={product} />
        ))}

        <Link
          href={viewMoreLink}
          className="relative rounded-lg overflow-hidden group block aspect-square bg-gray-100"
        >
          {overflowProduct && (
            <img
              src={getProductImage(overflowProduct)}
              alt=""
              className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
            />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white font-semibold tracking-wide text-sm text-center px-2">
              VIEW MORE
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function FeaturedTile({ product }) {
  const image = getProductImage(product);
  const price = getEffectivePrice(product);
  const strikethrough = getStrikethroughPrice(product);

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {image && (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="flex items-center gap-2 mt-1.5 text-sm">
        <span className="font-semibold text-gray-900">
          ৳{price.toLocaleString()}
        </span>
        {strikethrough && (
          <span className="text-gray-400 text-xs line-through">
            ৳{strikethrough.toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}


