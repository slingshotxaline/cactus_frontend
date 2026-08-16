"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  X,
  Home,
  LayoutGrid,
  Star,
  Truck,
  TrendingUp,
  Heart,
  ChevronRight,
  Phone,
  MapPin,
} from "lucide-react";

const CATEGORIES = [
  {
    label: "Men's Collection",
    href: "/products?category=men",
    children: ["T-Shirts", "Polo Shirts", "Shirts", "Bottoms"],
  },
  {
    label: "Women's Collection",
    href: "/products?category=women",
    children: ["Tops", "Dresses", "Bottoms"],
  },
  {
    label: "Kids Collection",
    href: "/products?category=kids",
    children: ["Boys", "Girls"],
  },
  {
    label: "Teens Collection",
    href: "/products?category=teens",
    children: ["T-Shirts", "Hoodies"],
  },
];

export default function MobileDrawer({ open, onClose }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState(null);

  if (!open) return null;

  const toggleCategory = (label) =>
    setExpanded((prev) => (prev === label ? null : label));

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute top-0 left-0 h-full w-[82%] max-w-sm bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 px-5 pt-6 pb-5 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <p className="text-white text-lg font-semibold">
              {isAuthenticated ? `Hi, ${user?.name?.split(" ")[0]}` : "Welcome"}
            </p>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isAuthenticated && (
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex-1 text-center bg-white text-gray-900 text-sm font-semibold py-2 rounded-lg"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex-1 text-center bg-white/10 text-white text-sm font-semibold py-2 rounded-lg border border-white/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2">
            <DrawerLink href="/" icon={Home} onClick={onClose}>
              Home
            </DrawerLink>
            <DrawerLink href="/products" icon={LayoutGrid} onClick={onClose}>
              Shop All
            </DrawerLink>
            <DrawerLink
              href="/products?new=true"
              icon={Star}
              iconClassName="text-emerald-500"
              onClick={onClose}
            >
              New Arrivals
            </DrawerLink>
            <DrawerLink
              href="/free-delivery"
              icon={Truck}
              iconClassName="text-sky-500"
              textClassName="text-sky-600"
              onClick={onClose}
            >
              Free Delivery
            </DrawerLink>
            <DrawerLink
              href="/products?sort=top-selling"
              icon={TrendingUp}
              onClick={onClose}
            >
              Top Selling
            </DrawerLink>
          </div>

          <div className="h-px bg-gray-100 my-2 mx-4" />

          <div className="px-4 pt-1 pb-2">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400">
              CATEGORIES
            </p>
          </div>
          <div className="px-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <button
                  onClick={() => toggleCategory(cat.label)}
                  className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  {cat.label}
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expanded === cat.label ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expanded === cat.label && (
                  <div className="pl-6 pb-1">
                    {cat.children.map((child) => (
                      <Link
                        key={child}
                        href={`${cat.href}&sub=${encodeURIComponent(child)}`}
                        onClick={onClose}
                        className="block px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {child}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 my-2 mx-4" />

          <div className="px-4 pt-1 pb-2">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400">
              MY ACCOUNT
            </p>
          </div>
          <div className="px-2">
            <DrawerLink href="/wishlist" icon={Heart} onClick={onClose}>
              My Wishlist
            </DrawerLink>
          </div>

          <div className="h-px bg-gray-100 my-2 mx-4" />

          <div className="px-2 pb-4">
            <DrawerLink href="/orders" icon={Truck} onClick={onClose}>
              Track Order
            </DrawerLink>
            <DrawerLink href="/contact" icon={Phone} onClick={onClose}>
              Contact Us
            </DrawerLink>
            <DrawerLink href="/stores" icon={MapPin} onClick={onClose}>
              Store Locations
            </DrawerLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawerLink({ href, icon: Icon, onClick, children, iconClassName, textClassName }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <Icon className={`w-[18px] h-[18px] ${iconClassName || "text-gray-400"}`} />
      <span className={`text-sm font-medium ${textClassName || "text-gray-700"}`}>
        {children}
      </span>
    </Link>
  );
}