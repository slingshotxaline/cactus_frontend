"use client";

import { useCartSync } from "../../hooks/useCartSync";

// Renders nothing — just keeps the cart-sync effect alive while mounted.
export default function CartSyncMount() {
  useCartSync();
  return null;
}
