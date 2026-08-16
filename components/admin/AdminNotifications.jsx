"use client";

import { useState } from "react";
import { useSocket } from "../../hooks/useSocket";

export default function AdminNotifications() {
  const [toast, setToast] = useState(null);

  useSocket({
    room: "admin",
    onEvent: {
      new_order: (payload) => setToast(`New order: ${payload.orderNumber} — ৳${payload.total.toLocaleString()}`),
      payment_success: (payload) => setToast(`Payment confirmed: ${payload.orderNumber}`),
      low_stock: (payload) => setToast(`Low stock: ${payload.title} (${payload.currentStock} left)`),
    },
  });

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg cursor-pointer"
      onClick={() => setToast(null)}
    >
      {toast}
    </div>
  );
}
