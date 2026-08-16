"use client";

import { useGetWishlistQuery } from "../../../features/wishlist/wishlistApi";
import ProductCard from "../../../components/shop/ProductCard";

export default function WishlistPage() {
  const { data, isLoading } = useGetWishlistQuery();

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-16">Loading...</div>;
  const products = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">Nothing saved yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
