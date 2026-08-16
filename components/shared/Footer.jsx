"use client";

import Link from "next/link";
import { useGetCategoriesQuery } from "../../features/categories/categoriesApi";
import Image from "next/image";

export default function Footer() {
  const { data } = useGetCategoriesQuery();
  const categories = (data?.data || []).slice(0, 6);

  return (
    <footer className="border-t border-gray-100 mt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          {/* <Link href="/" className="shrink-0">
            <Image
              src="/assets/logo/logo.png"
              alt="Enterprise Store"
              width={180}
              height={50}
              priority
              className="h-10 w-auto"
            />
          </Link> */}
           <p className="text-3xl text-black font-bold">CACTUS</p>
          <p className="text-sm text-gray-500 mt-2">
            Quality products, fast delivery across Bangladesh, and support you
            can count on.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Shop</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link href="/products" className="hover:text-brand-500">
                All Products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c._id}>
                <Link
                  href={`/products?category=${c._id}`}
                  className="hover:text-brand-500"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Customer Service
          </h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link href="/orders" className="hover:text-brand-500">
                Track My Order
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-brand-500">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-brand-500">
                Compare Products
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-500">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link href="/about" className="hover:text-brand-500">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-brand-500">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-brand-500">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-brand-500">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} Enterprise Store. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span>We accept:</span>
            {["Cash on Delivery", "bKash", "Card"].map((method) => (
              <span
                key={method}
                className="border border-gray-200 rounded px-2 py-0.5 bg-white"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
