"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

export default function CompareBar() {
  const items = useSelector((state) => state.compare.items);
  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-5 py-2.5 text-sm shadow-lg flex items-center gap-3 z-40">
      <span>{items.length} product{items.length > 1 ? "s" : ""} selected</span>
      <Link href="/compare" className="bg-white text-gray-900 px-3 py-1 rounded-full font-medium">
        Compare
      </Link>
    </div>
  );
}
