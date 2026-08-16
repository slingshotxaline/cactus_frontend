import ProductCard from "./ProductCard";

// Generic horizontal-scroll product row, reused for "Similar products",
// "Frequently bought together", "Recommended for you", "Trending".
export default function ProductCarousel({ title, products }) {
  if (!products?.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <div key={p._id} className="w-40 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
