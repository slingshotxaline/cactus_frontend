"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSyncCartMutation } from "../features/cart/cartApi";

// Debounced sync of the client-side cart to the server, so the abandoned-cart
// cron job (backend jobs/abandonedCart.job.js) has an up-to-date snapshot to
// check. Only syncs for logged-in users — guests aren't tracked server-side.
// Mount this once near the root of the authenticated shop experience.
export const useCartSync = () => {
  const items = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [syncCart] = useSyncCartMutation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      syncCart(items.map((i) => ({
        product: i.productId,
        variantId: i.variantId,
        title: i.title,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
      })));
    }, 2000); // debounce so rapid quantity clicks don't spam the API

    return () => clearTimeout(timeoutRef.current);
  }, [items, isAuthenticated, syncCart]);
};
