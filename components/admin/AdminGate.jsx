"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { STAFF_ROLES } from "../../features/auth/roles";

// Wraps the admin layout so non-staff users bounce back to the storefront
// instead of seeing an empty/broken dashboard behind a 403. Waits for
// `authChecked` (set once the root-level session bootstrap finishes) before
// deciding to redirect — otherwise a staff member refreshing an /admin page
// would get bounced during the brief window before their session is restored.
export default function AdminGate({ children }) {
  const { user, authChecked } = useSelector((state) => state.auth);
  const router = useRouter();
  const isStaff = user && STAFF_ROLES.includes(user.role);

  useEffect(() => {
    if (!authChecked) return;
    if (!isStaff) router.replace("/");
  }, [authChecked, isStaff, router]);

  if (!authChecked || !isStaff) {
    return <div className="p-8 text-gray-400 text-sm">Checking access...</div>;
  }

  return children;
}
