"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Search, Heart, Menu } from "lucide-react";
import AccountMenu from "./AccountMenu";
import MobileDrawer from "./MobileDrawer";
import MobileBottomNav from "./MobileBottomNav";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((n, i) => n + i.quantity, 0)
  );
  const wishlistCount = useSelector(
    (state) => state.wishlist?.items?.length || 0
  );

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center gap-4 md:gap-6">
          {/* Mobile: hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden -ml-1.5 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* <Link href="/" className="shrink-0 md:mr-2">
            <Image
              src="/assets/logo/logo.png"
              alt="Enterprise Store"
              width={180}
              height={50}
              priority
              className="h-7 md:h-10 w-auto"
            />
          </Link> */}
          <Link href="/"  className="text-3xl text-black font-bold">CACTUS</Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md hidden md:block"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-gray-50 border border-transparent rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 transition"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 ml-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile: search + wishlist, pinned right */}
          <div className="flex items-center gap-1 ml-auto md:hidden">
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-500 text-white text-[9px] font-semibold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop: cart + account */}
          <div className="hidden md:flex items-center gap-2 md:ml-2">
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Cart"
            >
              <Search className="w-5 h-5 hidden" />
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <AccountMenu />
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 bg-white">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border border-transparent rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 transition"
                />
              </div>
            </form>
          </div>
        )}
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <MobileBottomNav cartCount={cartCount} />
    </>
  );
}
