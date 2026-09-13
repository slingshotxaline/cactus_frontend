"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  Tag,
  Boxes,
  Truck,
  Ticket,
  RotateCcw,
  LayoutTemplate,
  Image as ImageIcon,
  Newspaper,
  FileText,
  Activity,
  Menu,
  X,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: null,
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/returns", label: "Returns", icon: RotateCcw },
      { href: "/admin/shipping", label: "Shipping", icon: Truck },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      // { href: "/admin/brands", label: "Brands", icon: Tag },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/homepage-sections",
        label: "Homepage Sections",
        icon: LayoutTemplate,
      },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity", label: "Activity Log", icon: Activity },
      { href: "/admin/traffic", label: "Site Traffic", icon: Truck },
    ],
  },
];

function NavLink({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-brand-50 text-brand-600"
          : " text-white hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span
        className={`absolute left-0 h-5 w-0.5 rounded-full bg-brand-500 transition-all duration-200 ${
          active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      />
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? "text-brand-500" : " text-white group-hover:text-gray-500"
        }`}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }) {
  return (
    <>
      <Link href="/" className="block shrink-0 px-1">
        <Image
          src="/assets/logo/Cactus Logo-White.png"
          alt="Enterprise Store"
          width={180}
          height={50}
          priority
          className="h-full w-auto"
        />
      </Link>
      {/* <p className="text-3xl text-white font-bold">CACTUS</p> */}
      {/* <p className="text-xl text-white font-bold ml-4">Clothing</p> */}

      {/* <div className="mb-5 mt-3 px-3 text-lg font-bold text-brand-500">
        Admin
      </div> */}

      <nav className="flex-1 space-y-5 overflow-y-auto px-1 py-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[14px] font-bold uppercase tracking-wider text-white">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // close the drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <Image
          src="/assets/logo/logo.png"
          alt="Enterprise Store"
          width={140}
          height={38}
          className="h-8 w-auto"
        />
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600"
          aria-label="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-blue-950 bg-gradient-to-br from-black via-[#020817] to-[#001f3f] py-6 px-3 lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[80vw] translate-x-0 flex-col bg-gradient-to-br from-black via-[#020817] to-[#001f3f] py-6 px-3 shadow-xl transition-transform duration-300">
            <div className="mb-2 flex items-center justify-between px-3">
              {/* <span className="text-lg font-bold text-brand-500">Admin</span> */}
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label="Close menu"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
