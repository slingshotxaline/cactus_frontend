"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Home, LayoutGrid, ShoppingCart, MessageCircle, User } from "lucide-react";

export default function MobileBottomNav({ cartCount }) {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Category", icon: LayoutGrid },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { href: "/support", label: "Chat", icon: MessageCircle },
    {
      href: isAuthenticated ? "/profile" : "/login",
      label: isAuthenticated ? "Account" : "Login",
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, badge }) => {
          const active =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
            >
              <span className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-brand-500" : "text-gray-500"
                  }`}
                  strokeWidth={active ? 2.4 : 2}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[9px] font-semibold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                    {badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-brand-500" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}