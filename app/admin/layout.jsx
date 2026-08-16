"use client";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNotifications from "../../components/admin/AdminNotifications";
import AdminGate from "../../components/admin/AdminGate";

export default function AdminLayout({ children }) {
  return (
    <AdminGate>
      <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 overflow-auto lg:ml-64">
          <div className="min-w-max p-6 lg:p-8">{children}</div>
        </main>
        <AdminNotifications />
      </div>
    </AdminGate>
  );
}
