"use client";

import Link from "next/link";
import { trackClick } from "../../lib/tracking";

// Full-bleed text announcement strip — dark overlay background image (or a
// plain dark background if no image is set), centered heading + description
// + an outlined/filled CTA button. No products or categories involved —
// purely a promotional message, configured entirely from
// /admin/homepage-sections.
export default function PromoBannerSection({ section }) {
  const { promoBanner } = section;
  if (!promoBanner) return null;

  const { image, heading, description, ctaLabel, ctaUrl, textTheme } =
    promoBanner;
  const isLight = textTheme !== "dark"; // default: light text, for a dark/dark-overlaid background

  const content = (
    <div
      className={`relative rounded-2xl overflow-hidden mb-14 ${
        !image?.url ? "bg-gray-900" : ""
      }`}
    >
      {image?.url && (
        <>
          <img
            src={image.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-20 md:py-24">
        {heading && (
          <h2
            className={`text-2xl md:text-3xl font-bold max-w-2xl ${
              isLight ? "text-white" : "text-gray-900"
            }`}
          >
            {heading}
          </h2>
        )}
        {description && (
          <p
            className={`mt-4 max-w-xl text-sm md:text-base font-medium ${
              isLight ? "text-white/85" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        )}
        {ctaLabel && (
          <span
            className={`mt-8 inline-block px-8 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
              isLight
                ? "bg-white text-gray-900 hover:bg-gray-100"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {ctaLabel}
          </span>
        )}
      </div>
    </div>
  );

  if (!ctaUrl) return content;

  return (
    <Link
      href={ctaUrl}
      onClick={() => trackClick(`promo_banner:${section._id}`)}
      className="block"
    >
      {content}
    </Link>
  );
}
