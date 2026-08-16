"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  PackageX,
  ReceiptText,
  FileDown,
  MapPin,
  User,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Navigation,
  PackageCheck,
  XCircle,
  RotateCcw,
  Banknote,
  AlertTriangle,
  ChevronUp,
} from "lucide-react";
import { useGetOrderQuery } from "../../../../features/orders/ordersApi";
import { useUpdateOrderStatusMutation } from "../../../../features/admin/adminApi";
import DownloadFileButton from "../../../../components/shared/DownloadFileButton";
import StatusBadge, {
  STATUS_META,
} from "../../../../components/admin/StatusBadge";

const STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "returned",
  "refunded",
  "failed",
];

// Linear happy-path pipeline used for the visual stepper.
const PIPELINE = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for delivery", icon: Navigation },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const EXCEPTION_META = {
  cancelled: {
    icon: XCircle,
    classes: "border-red-100 bg-red-50 text-red-700",
    iconClasses: "text-red-500",
    label: "This order was cancelled",
  },
  failed: {
    icon: AlertTriangle,
    classes: "border-red-100 bg-red-50 text-red-700",
    iconClasses: "text-red-500",
    label: "This order failed",
  },
  returned: {
    icon: RotateCcw,
    classes: "border-amber-100 bg-amber-50 text-amber-700",
    iconClasses: "text-amber-500",
    label: "This order was returned",
  },
  refunded: {
    icon: Banknote,
    classes: "border-violet-100 bg-violet-50 text-violet-700",
    iconClasses: "text-violet-500",
    label: "This order was refunded",
  },
};

const GLOBAL_STYLES = `
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes toastIn { from { opacity: 0; transform: translateY(8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes popIn { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
.shimmer-bg {
  background-image: linear-gradient(90deg, #f3f4f6 0px, #eceef1 40px, #f3f4f6 80px);
  background-size: 800px 100%;
  animation: shimmer 1.6s linear infinite;
}
`;

function Section({
  title,
  children,
  delay = 0,
  collapsible = false,
  defaultOpen = true,
  badge,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="animate-[fadeUp_.5s_ease-out_backwards] rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`mb-3 flex items-center justify-between ${
          collapsible ? "cursor-pointer select-none" : ""
        }`}
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-gray-900">{title}</h2>
          {badge}
        </div>
        {collapsible && (
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
      <div
        className={`grid transition-all duration-300 ease-out ${
          collapsible && !open
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl">
      <div className="h-4 w-28 rounded shimmer-bg" />
      <div className="mt-4 h-7 w-48 rounded shimmer-bg" />
      <div className="mt-2 h-4 w-36 rounded shimmer-bg" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="h-40 rounded-xl shimmer-bg" />
          <div className="h-32 rounded-xl shimmer-bg" />
        </div>
        <div className="space-y-4">
          <div className="h-28 rounded-xl shimmer-bg" />
          <div className="h-24 rounded-xl shimmer-bg" />
          <div className="h-24 rounded-xl shimmer-bg" />
        </div>
      </div>
    </div>
  );
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      title={`Copy ${label}`}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 animate-[popIn_.25s_ease-out]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function StatusStepper({ status, onSelect, isUpdating, pendingStatus }) {
  const activeIndex = PIPELINE.findIndex((s) => s.key === status);
  const progressPct =
    activeIndex <= 0 ? 0 : (activeIndex / (PIPELINE.length - 1)) * 100;

  return (
    <div className="relative pb-1 pt-2">
      <div className="absolute left-0 right-0 top-[19px] h-0.5 -translate-y-1/2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="relative flex justify-between">
        {PIPELINE.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isThisPending = pendingStatus === step.key && isUpdating;
          return (
            <button
              key={step.key}
              type="button"
              disabled={isUpdating}
              title={step.label}
              onClick={() => onSelect(step.key)}
              className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-medium transition-all duration-300 ${
                  isActive
                    ? "scale-110 border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : isDone
                    ? "border-emerald-400 bg-emerald-50 text-emerald-500"
                    : "border-gray-200 bg-white text-gray-300 group-hover:border-gray-300 group-hover:text-gray-400"
                }`}
              >
                {isThisPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={`hidden text-[10px] leading-tight transition-colors sm:block ${
                  isActive ? "font-medium text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg animate-[toastIn_.25s_ease-out] ${
        isError
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? (
        <AlertTriangle className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}
      {toast.message}
    </div>
  );
}

export default function AdminOrderDetailPage({ params }) {
  const { data, isLoading } = useGetOrderQuery(params.id);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const order = data?.data?.order;
  const payments = data?.data?.payments || [];

  const handleStatusChange = (status) => {
    if (!order || status === order.status) return;
    setPendingStatus(status);
    updateStatus({
      id: order._id,
      status,
      note: `Status changed to ${status}`,
    })
      .unwrap()
      .then(() => {
        setToast({
          type: "success",
          message: `Status updated to ${STATUS_META[status]?.label ?? status}`,
        });
      })
      .catch(() => {
        setToast({
          type: "error",
          message: "Couldn't update status. Try again.",
        });
      })
      .finally(() => setPendingStatus(null));
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <Toast toast={toast} />

      {isLoading ? (
        <DetailSkeleton />
      ) : !order ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <PackageX className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Order not found
          </p>
          <Link
            href="/admin/orders"
            className="mt-3 text-sm text-brand-500 hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
      ) : (
        <OrderDetail
          order={order}
          payments={payments}
          isUpdating={isUpdating}
          pendingStatus={pendingStatus}
          handleStatusChange={handleStatusChange}
          historyExpanded={historyExpanded}
          setHistoryExpanded={setHistoryExpanded}
        />
      )}
    </>
  );
}

function OrderDetail({
  order,
  payments,
  isUpdating,
  pendingStatus,
  handleStatusChange,
  historyExpanded,
  setHistoryExpanded,
}) {
  const exception = EXCEPTION_META[order.status];
  const history = [...order.statusHistory].reverse();
  const visibleHistory = historyExpanded ? history : history.slice(0, 3);

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:-translate-x-0.5 hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Orders
      </Link>

      <div className="mt-3 mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <CopyButton value={order.orderNumber} label="order number" />
            <StatusBadge status={order.status} type="order" />
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <DownloadFileButton
            path={`/invoices/${order._id}/packing-slip`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-600 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:translate-y-0"
          >
            <ReceiptText className="h-4 w-4" />
            Packing Slip
          </DownloadFileButton>
          <DownloadFileButton
            path={`/invoices/${order._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-600 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:translate-y-0"
          >
            <FileDown className="h-4 w-4" />
            Download Invoice
          </DownloadFileButton>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Section title="Items" delay={0}>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, i) => {
                const variantLabel = [item.color, item.size]
                  .filter(Boolean)
                  .join(" / ");
                return (
                  <div
                    key={item._id}
                    className="flex animate-[fadeUp_.4s_ease-out_backwards] items-center gap-3 rounded-lg py-3 px-2 -mx-2 transition-colors duration-200 first:pt-0 last:pb-0 hover:bg-gray-50"
                    style={{ animationDelay: `${80 + i * 40}ms` }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-gray-100 transition-transform duration-200 hover:scale-105"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-50" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      {variantLabel && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                          {item.color && (
                            <span className="inline-flex items-center gap-1">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: item.color.toLowerCase(),
                                }}
                              />
                              {item.color}
                            </span>
                          )}
                          {item.color && item.size && <span>·</span>}
                          {item.size && <span>Size {item.size}</span>}
                        </p>
                      )}
                      {item.sku && (
                        <p className="mt-0.5 font-mono text-[11px] text-gray-400">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Qty {item.quantity} × ৳{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-gray-900">
                      ৳{item.subtotal.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Discount{" "}
                    {order.coupon?.code ? `(${order.coupon.code})` : ""}
                  </span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>
                  Shipping{" "}
                  {order.shippingZoneName ? `(${order.shippingZoneName})` : ""}
                </span>
                <span>৳{order.shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </Section>

          <Section
            title="Status History"
            delay={100}
            collapsible={history.length > 3}
            defaultOpen={true}
            badge={
              history.length > 3 && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  {history.length}
                </span>
              )
            }
          >
            <div className="relative space-y-5 pl-1">
              {visibleHistory.length > 1 && (
                <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-gray-100" />
              )}
              {visibleHistory.map((entry, i) => {
                const meta = STATUS_META[entry.status] || STATUS_META.pending;
                return (
                  <div
                    key={i}
                    className="relative flex animate-[fadeUp_.4s_ease-out_backwards] gap-3 pl-5 text-sm"
                    style={{ animationDelay: `${120 + i * 50}ms` }}
                  >
                    <span
                      className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                        meta.dot
                      } ${i === 0 ? "animate-[popIn_.3s_ease-out]" : ""}`}
                    />
                    <div>
                      <span className="font-medium capitalize text-gray-800">
                        {meta.label}
                      </span>
                      {entry.note && (
                        <p className="mt-0.5 text-gray-500">{entry.note}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(entry.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {history.length > 3 && (
              <button
                type="button"
                onClick={() => setHistoryExpanded((v) => !v)}
                className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
              >
                {historyExpanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show all {history.length} updates{" "}
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </Section>

          {payments.length > 0 && (
            <Section title="Payment Attempts" delay={200}>
              {/* Mobile cards */}
              <div className="space-y-2 sm:hidden">
                {payments.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-lg border border-gray-100 p-3 text-sm transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {p.gateway}
                      </span>
                      <StatusBadge status={p.status} type="payment" />
                    </div>
                    <p className="mt-1 text-gray-500">
                      ৳{p.amount.toLocaleString()}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <p className="truncate font-mono text-xs text-gray-400">
                        {p.transactionId || "—"}
                      </p>
                      <CopyButton
                        value={p.transactionId}
                        label="transaction ID"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                      <th className="pb-2 font-medium">Gateway</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Transaction ID</th>
                      <th className="pb-2 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr
                        key={p._id}
                        className="animate-[fadeUp_.35s_ease-out_backwards] border-t border-gray-50 transition-colors hover:bg-gray-50"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <td className="py-2.5">{p.gateway}</td>
                        <td className="py-2.5 font-medium text-gray-900">
                          ৳{p.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          <StatusBadge status={p.status} type="payment" />
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1 font-mono text-xs text-gray-400">
                            {p.transactionId || "—"}
                            <CopyButton
                              value={p.transactionId}
                              label="transaction ID"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 text-gray-400">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6 md:sticky md:top-6 md:self-start">
          <Section title="Order Status" delay={50}>
            {exception ? (
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${exception.classes}`}
              >
                <exception.icon
                  className={`h-4 w-4 shrink-0 ${exception.iconClasses}`}
                />
                {exception.label}
              </div>
            ) : (
              <StatusStepper
                status={order.status}
                onSelect={handleStatusChange}
                isUpdating={isUpdating}
                pendingStatus={pendingStatus}
              />
            )}

            <div className="relative mt-4 flex items-center gap-1.5 rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-600 transition-colors focus-within:border-gray-300">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="w-full cursor-pointer appearance-none bg-transparent capitalize outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s]?.label ?? s}
                  </option>
                ))}
              </select>
              {isUpdating ? (
                <Loader2 className="absolute right-2.5 h-3.5 w-3.5 animate-spin text-gray-400" />
              ) : (
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 opacity-50" />
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span>Payment:</span>
              <StatusBadge status={order.paymentStatus} type="payment" />
              <span>· {order.paymentMethod}</span>
            </div>
          </Section>

          <Section title="Customer" delay={100}>
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {order.customer?.name}
                </p>
                {order.customer?.email && (
                  <p className="truncate text-sm text-gray-500">
                    {order.customer.email}
                  </p>
                )}
                {order.customer?.phone && (
                  <p className="text-sm text-gray-500">
                    {order.customer.phone}
                  </p>
                )}
                {order.customer?.isGuest && (
                  <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                    Guest account
                  </span>
                )}
              </div>
            </div>
          </Section>

          <Section title="Shipping Address" delay={150}>
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-0.5 text-sm text-gray-600">
                <p>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}
                  {order.shippingAddress?.district
                    ? `, ${order.shippingAddress.district}`
                    : ""}
                </p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}