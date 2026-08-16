"use client";

import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../features/wishlist/wishlistApi";

export default function WishlistButton({ productId }) {
  const { data } = useGetWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isWishlisted = data?.data?.some((p) => p._id === productId);

  const toggle = () =>
    isWishlisted ? removeFromWishlist(productId) : addToWishlist(productId);

  return (
    <button
      onClick={toggle}
      aria-label="Toggle wishlist"
      className={`border rounded-lg px-4 py-3 font-medium transition-colors ${
        isWishlisted
          ? "border-brand-500 text-brand-500 bg-brand-50"
          : "border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
    </button>
  );
}
