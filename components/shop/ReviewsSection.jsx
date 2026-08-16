"use client";

import { useState } from "react";
import {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useVoteHelpfulMutation,
} from "../../features/reviews/reviewsApi";

export default function ReviewsSection({ productId }) {
  const { data, isLoading } = useGetProductReviewsQuery(productId);
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  const [voteHelpful] = useVoteHelpfulMutation();
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, ...form }).unwrap();
      setForm({ rating: 5, title: "", comment: "" });
    } catch (err) {
      alert(err?.data?.message || "Could not submit review.");
    }
  };

  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-bold mb-4">Reviews</h2>

      {isLoading && <p className="text-gray-500">Loading reviews...</p>}

      <div className="space-y-4 mb-8">
        {data?.data?.map((review) => (
          <div key={review._id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{review.customer?.name}</span>
              {review.isVerifiedPurchase && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              )}
              <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
            </div>
            {review.title && <p className="font-medium mt-1">{review.title}</p>}
            <p className="text-gray-600 mt-1">{review.comment}</p>
            <button
              onClick={() => voteHelpful(review._id)}
              className="text-sm text-gray-400 hover:text-brand-500 mt-2"
            >
              Helpful ({review.helpfulVotes})
            </button>
          </div>
        ))}
        {data?.data?.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
      </div>

      <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4 space-y-3">
        <h3 className="font-medium">Write a review</h3>
        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          className="border rounded px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n > 1 && "s"}
            </option>
          ))}
        </select>
        <input
          placeholder="Title (optional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Share your experience"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </section>
  );
}
