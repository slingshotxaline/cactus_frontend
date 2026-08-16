export const STATUS_META = {
    pending: { label: "Pending", dot: "bg-amber-500", classes: "bg-amber-50 text-amber-700 border-amber-100" },
    confirmed: { label: "Confirmed", dot: "bg-sky-500", classes: "bg-sky-50 text-sky-700 border-sky-100" },
    packed: { label: "Packed", dot: "bg-violet-500", classes: "bg-violet-50 text-violet-700 border-violet-100" },
    shipped: { label: "Shipped", dot: "bg-indigo-500", classes: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    out_for_delivery: { label: "Out for delivery", dot: "bg-blue-500", classes: "bg-blue-50 text-blue-700 border-blue-100" },
    delivered: { label: "Delivered", dot: "bg-emerald-500", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    completed: { label: "Completed", dot: "bg-teal-500", classes: "bg-teal-50 text-teal-700 border-teal-100" },
    cancelled: { label: "Cancelled", dot: "bg-gray-400", classes: "bg-gray-50 text-gray-600 border-gray-200" },
    returned: { label: "Returned", dot: "bg-orange-500", classes: "bg-orange-50 text-orange-700 border-orange-100" },
    refunded: { label: "Refunded", dot: "bg-rose-500", classes: "bg-rose-50 text-rose-700 border-rose-100" },
    failed: { label: "Failed", dot: "bg-red-500", classes: "bg-red-50 text-red-700 border-red-100" },
  };
  
  export const PAYMENT_META = {
    paid: { label: "Paid", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    success: { label: "Success", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border-amber-100" },
    initiated: { label: "Initiated", classes: "bg-sky-50 text-sky-700 border-sky-100" },
    unpaid: { label: "Unpaid", classes: "bg-gray-50 text-gray-600 border-gray-200" },
    cancelled: { label: "Cancelled", classes: "bg-gray-50 text-gray-600 border-gray-200" },
    failed: { label: "Failed", classes: "bg-red-50 text-red-700 border-red-100" },
    refunded: { label: "Refunded", classes: "bg-rose-50 text-rose-700 border-rose-100" },
  };
  
  export default function StatusBadge({ status, type = "order" }) {
    const meta =
      (type === "payment" ? PAYMENT_META[status] : STATUS_META[status]) || {
        label: status || "—",
        dot: "bg-gray-400",
        classes: "bg-gray-50 text-gray-600 border-gray-200",
      };
  
    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${meta.classes}`}
      >
        {type === "order" && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
        {meta.label}
      </span>
    );
  }