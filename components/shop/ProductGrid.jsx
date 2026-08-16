"use client";

import { useGetProductsQuery } from "../../features/products/productsApi";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const { data, isLoading, isError } = useGetProductsQuery({ limit: 12 });

  if (isLoading)
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>;

  if (isError) return <p className="text-gray-500">Could not load products.</p>;

  const products = data?.data || [];
  if (!products.length) return <p className="text-gray-500">No products yet.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
