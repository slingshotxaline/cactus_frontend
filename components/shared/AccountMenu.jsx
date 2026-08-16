"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Package,
  Heart,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useLogoutMutation } from "../../features/auth/authApi";
import { clearCredentials } from "../../features/auth/authSlice";
import { setAccessToken } from "../../services/apiClient";
import { STAFF_ROLES } from "../../features/auth/roles";

export default function AccountMenu() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
        <Link
          href="/login"
          className="px-2.5 sm:px-3 py-1.5 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-full transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // even if the API call fails, clear local state so the UI reflects logged-out
    }
    dispatch(clearCredentials());
    setAccessToken(null);
    setOpen(false);
    router.push("/");
  };

  const isStaff = STAFF_ROLES.includes(user?.role);
  const initial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 pl-1 pr-1 sm:pr-2.5 py-1 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
          open ? "bg-gray-50" : ""
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="relative w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold ring-1 ring-brand-100 shrink-0">
          {initial}
          {user?.isGuest && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white" />
          )}
        </span>
        <span className="hidden sm:inline max-w-[110px] truncate">
          {user?.name}
        </span>
        <ChevronDown
          className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-lg shadow-black/5 py-1.5 text-sm origin-top-right animate-in fade-in zoom-in-95 duration-100">
          {/* Identity header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-50 mb-1">
            <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold ring-1 ring-brand-100 shrink-0">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              {user?.isGuest ? (
                <span className="inline-block text-[11px] font-medium bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full mt-0.5">
                  Guest account
                </span>
              ) : user?.email ? (
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>

          {user?.isGuest && (
            <Link
              href="/set-password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 mx-1.5 mb-1 px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 font-medium transition-colors"
            >
              <Lock className="w-4 h-4" />
              Secure your account
            </Link>
          )}

          <MenuLink href="/profile" icon={User} onClick={() => setOpen(false)}>
            My Profile
          </MenuLink>
          <MenuLink
            href="/orders"
            icon={Package}
            onClick={() => setOpen(false)}
          >
            My Orders
          </MenuLink>
          <MenuLink
            href="/wishlist"
            icon={Heart}
            onClick={() => setOpen(false)}
          >
            Wishlist
          </MenuLink>

          {isStaff && (
            <>
              <div className="h-px bg-gray-50 my-1.5 mx-3" />
              <MenuLink
                href="/admin"
                icon={ShieldCheck}
                onClick={() => setOpen(false)}
                accent
              >
                Admin Dashboard
              </MenuLink>
            </>
          )}

          <div className="h-px bg-gray-50 my-1.5 mx-3" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2 mx-0 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon: Icon, onClick, accent, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 mx-1.5 rounded-lg hover:bg-gray-50 transition-colors ${
        accent ? "text-brand-600 font-medium" : "text-gray-700"
      }`}
    >
      <Icon className="w-4 h-4 text-gray-400" />
      {children}
    </Link>
  );
}