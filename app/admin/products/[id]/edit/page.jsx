"use client";

import { useGetProductsQuery } from "../../../../../features/products/productsApi";
import ProductForm from "../../../../../components/admin/ProductForm";

// Products are fetched by slug on the public API; for the admin edit screen we
// pull the full list and find by id (fine at this scale — swap for a
// GET /products/by-id/:id endpoint if the catalog grows past a few hundred items).
export default function EditProductPage({ params }) {
  const { data, isLoading } = useGetProductsQuery({ limit: 200 });
  const product = data?.data?.find((p) => p._id === params.id);

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!product) return <p className="text-gray-500">Product not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialProduct={product} />
    </div>
  );
}
