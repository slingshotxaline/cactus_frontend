"use client";

import { useSelector } from "react-redux";
import ProductCarousel from "./ProductCarousel";

export default function RecentlyViewedCarousel({ excludeId }) {
  const items = useSelector((state) => state.recentlyViewed.items);
  const filtered = excludeId ? items.filter((p) => p._id !== excludeId) : items;

  return <ProductCarousel title="Recently Viewed" products={filtered} />;
}
