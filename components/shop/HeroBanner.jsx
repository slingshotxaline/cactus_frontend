"use client";

import { useState, useEffect } from "react";
import { useGetActiveBannersQuery } from "../../features/cms/pagesApi";
import { trackClick } from "../../lib/tracking";

export default function HeroBanner() {
  const { data, isLoading } = useGetActiveBannersQuery("homepage_hero");
  const [index, setIndex] = useState(0);

  const banners = data?.data || [];

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      5000
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const banner = banners[index];
  const handleClick = () => trackClick(`hero_banner:${banner._id}`);

  const Wrapper = ({ children }) =>
    banner.linkUrl ? (
      <a href={banner.linkUrl} onClick={handleClick}>
        {children}
      </a>
    ) : (
      <div>{children}</div>
    );

  return (
    <div className="relative mb-10 rounded-2xl overflow-hidden bg-gray-100">
      <Wrapper>
        <img
          src={banner.image?.url}
          alt={banner.title || "Promotional banner"}
          className="w-full aspect-[21/9] md:aspect-[3/1] object-cover"
        />
        {banner.title && (
          <div className="absolute inset-0 bg-black/20 flex items-end p-6">
            <h2 className="text-white text-xl md:text-2xl font-bold drop-shadow">
              {banner.title}
            </h2>
          </div>
        )}
      </Wrapper>

      {banners.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              className={`w-2 h-2 rounded-full ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
