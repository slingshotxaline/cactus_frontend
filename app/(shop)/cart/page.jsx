"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  removeItem,
  updateQuantity,
  clearCart,
} from "../../../features/cart/cartSlice";
import {
  useCreateOrderMutation,
  useCreateGuestOrderMutation,
} from "../../../features/orders/ordersApi";
import { useGetActiveShippingZonesQuery } from "../../../features/shipping/shippingApi";
import { useGetMeQuery } from "../../../features/auth/authApi";
import { useInitiatePaymentMutation } from "../../../features/payment/paymentApi";
import { setCredentials } from "../../../features/auth/authSlice";
import { setAccessToken } from "../../../services/apiClient";

export default function CartPage() {
  const items = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const router = useRouter();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const [createGuestOrder, { isLoading: isPlacingGuestOrder }] =
    useCreateGuestOrderMutation();
  const [initiatePayment, { isLoading: isInitiatingPayment }] =
    useInitiatePaymentMutation();
  const { data: zonesData, isLoading: isLoadingZones } =
    useGetActiveShippingZonesQuery();
  const { data: meData } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  const [couponCode, setCouponCode] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingZoneId, setShippingZoneId] = useState("");
  const [error, setError] = useState("");

  const zones = zonesData?.data || [];

  useEffect(() => {
    if (!shippingZoneId && zones.length) {
      setShippingZoneId((zones.find((z) => z.isDefault) || zones[0])._id);
    }
  }, [zones, shippingZoneId]);

  useEffect(() => {
    const defaultAddress = meData?.data?.user?.addresses?.find(
      (a) => a.isDefault
    );
    if (defaultAddress) {
      setShippingAddress((prev) =>
        prev.fullName
          ? prev
          : {
              fullName: defaultAddress.fullName || "",
              phone: defaultAddress.phone || "",
              street: defaultAddress.street || "",
              city: defaultAddress.city || "",
              district: defaultAddress.district || "",
              postalCode: defaultAddress.postalCode || "",
            }
      );
    }
  }, [meData]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const selectedZone = zones.find((z) => z._id === shippingZoneId);
  const shippingEstimate = selectedZone?.charge ?? 0;
  const isPlacingAnyOrder =
    isPlacingOrder || isPlacingGuestOrder || isInitiatingPayment;

  if (!items.length)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Your cart is empty.
      </div>
    );

  const handleCheckout = async () => {
    setError("");

    if (!shippingZoneId) {
      setError("Please select a delivery zone.");
      return;
    }

    const orderPayload = {
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        size: i.size,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
      shippingZoneId,
      couponCode: couponCode || undefined,
    };

    const proceedToPaymentOrOrder = async (orderId) => {
      if (paymentMethod === "cod") {
        router.push(`/orders/${orderId}`);
        return;
      }
      try {
        const result = await initiatePayment({ orderId }).unwrap();
        if (result.data.redirectUrl) {
          window.location.href = result.data.redirectUrl;
        } else {
          router.push(`/orders/${orderId}`);
        }
      } catch (err) {
        setError(
          err?.data?.message ||
            "Order placed, but payment could not be started. You can retry from your order page."
        );
        router.push(`/orders/${orderId}`);
      }
    };

    try {
      if (isAuthenticated) {
        const order = await createOrder(orderPayload).unwrap();
        dispatch(clearCart());
        await proceedToPaymentOrOrder(order.data._id);
        return;
      }

      if (!shippingAddress.fullName || !shippingAddress.phone) {
        setError("Full name and phone number are required to place an order.");
        return;
      }

      const result = await createGuestOrder({
        name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        ...orderPayload,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.data.user,
          accessToken: result.data.accessToken,
        })
      );
      setAccessToken(result.data.accessToken);

      dispatch(clearCart());
      await proceedToPaymentOrOrder(result.data.order._id);
    } catch (err) {
      setError(
        err?.data?.message ||
          "Could not place order. Please check your details."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => {
          const variantLabel = [item.color, item.size]
            .filter(Boolean)
            .join(" / ");
          return (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex items-center gap-4 border-b border-gray-100 pb-4"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.title}</p>
                {variantLabel && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.color && (
                      <span className="inline-flex items-center gap-1">
                        Color:
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.color.toLowerCase() }}
                        />
                        {item.color}
                      </span>
                    )}
                    {item.color && item.size && (
                      <span className="mx-1.5">|</span>
                    )}
                    {item.size && <span>Size: {item.size}</span>}
                  </p>
                )}
                {item.sku && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    SKU: {item.sku}
                  </p>
                )}
                <p className="text-brand-500 mt-1">
                  ৳{item.price.toLocaleString()}
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  dispatch(
                    updateQuantity({
                      productId: item.productId,
                      variantId: item.variantId,
                      quantity: Number(e.target.value),
                    })
                  )
                }
                className="w-16 border rounded px-2 py-1"
              />
              <button
                onClick={() =>
                  dispatch(
                    removeItem({
                      productId: item.productId,
                      variantId: item.variantId,
                    })
                  )
                }
                className="text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-8">
        <h2 className="font-medium mb-2">Delivery Location</h2>
        {isLoadingZones ? (
          <p className="text-sm text-gray-400">Loading delivery options...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {zones.map((zone) => (
              <button
                key={zone._id}
                type="button"
                onClick={() => setShippingZoneId(zone._id)}
                className={`border rounded-lg p-3 text-left text-sm ${
                  shippingZoneId === zone._id
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200"
                }`}
              >
                <p className="font-medium text-gray-900">{zone.name}</p>
                <p className="text-brand-500 font-semibold mt-1">
                  ৳{zone.charge.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Shipping{selectedZone ? ` (${selectedZone.name})` : ""}</span>
          <span>৳{shippingEstimate.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-1">
          <span>Estimated Total</span>
          <span>৳{(subtotal + shippingEstimate).toLocaleString()}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Coupon discount, if any, is applied when the order is placed.
      </p>

      {!isAuthenticated && (
        <div className="mt-6 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-600">
          Checking out as a guest — we'll create an account for you
          automatically using the name and phone number below. Already have an
          account?{" "}
          <Link href="/login" className="text-brand-500 hover:underline">
            Log in
          </Link>{" "}
          for faster checkout.
        </div>
      )}

      <div className="mt-8 space-y-3">
        <h2 className="font-medium">
          {isAuthenticated
            ? "Shipping Address"
            : "Your Details & Shipping Address"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Full name"
            required
            className="border rounded px-3 py-2 text-sm"
            value={shippingAddress.fullName}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                fullName: e.target.value,
              })
            }
          />
          <input
            placeholder="Phone"
            required
            className="border rounded px-3 py-2 text-sm"
            value={shippingAddress.phone}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, phone: e.target.value })
            }
          />
          <input
            placeholder="Street"
            className="col-span-2 border rounded px-3 py-2 text-sm"
            value={shippingAddress.street}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, street: e.target.value })
            }
          />
          <input
            placeholder="City"
            className="border rounded px-3 py-2 text-sm"
            value={shippingAddress.city}
            onChange={(e) =>
              setShippingAddress({ ...shippingAddress, city: e.target.value })
            }
          />
          <input
            placeholder="District"
            className="border rounded px-3 py-2 text-sm"
            value={shippingAddress.district}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                district: e.target.value,
              })
            }
          />
        </div>

        <h2 className="font-medium pt-2">Payment Method</h2>
        <div className="flex gap-3">
          {["cod", "bkash", "sslcommerz"].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`border rounded-lg px-4 py-2 text-sm ${
                paymentMethod === method
                  ? "border-brand-500 text-brand-500 bg-brand-50"
                  : "border-gray-200"
              }`}
            >
              {method === "cod"
                ? "Cash on Delivery"
                : method === "bkash"
                ? "bKash"
                : "Card / SSLCommerz"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={isPlacingAnyOrder}
        className="mt-6 w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {isPlacingAnyOrder
          ? "Placing order..."
          : paymentMethod === "cod"
          ? "Place Order"
          : "Place Order & Pay"}
      </button>
    </div>
  );
}
