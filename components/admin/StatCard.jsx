"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

function useCountUp(value, duration = 800) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef();

  useEffect(() => {
    const start = prevValue.current;
    const end = typeof value === "number" ? value : 0;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = end;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return display;
}

const THEMES = {
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    hoverShadow: "hover:shadow-emerald-100",
    bar: "from-emerald-400 to-emerald-500",
  },
  sky: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    hoverBorder: "hover:border-sky-200",
    hoverShadow: "hover:shadow-sky-100",
    bar: "from-sky-400 to-sky-500",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-200",
    hoverShadow: "hover:shadow-amber-100",
    bar: "from-amber-400 to-amber-500",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    hoverBorder: "hover:border-violet-200",
    hoverShadow: "hover:shadow-violet-100",
    bar: "from-violet-400 to-violet-500",
  },
  fuchsia: {
    iconBg: "bg-fuchsia-50",
    iconColor: "text-fuchsia-600",
    hoverBorder: "hover:border-fuchsia-200",
    hoverShadow: "hover:shadow-fuchsia-100",
    bar: "from-fuchsia-400 to-fuchsia-500",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    hoverBorder: "hover:border-rose-200",
    hoverShadow: "hover:shadow-rose-100",
    bar: "from-rose-400 to-rose-500",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  sublabel,
  accent = "sky",
  trend,
  index = 0,
  loading = false,
  pulse = false,
}) {
  const theme = THEMES[accent] ?? THEMES.sky;
  const display = useCountUp(loading ? 0 : value);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl ${
        theme.hoverBorder
      } ${theme.hoverShadow} ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {/* faint watermark icon */}
      {Icon && (
        <Icon
          className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 text-gray-50 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
          strokeWidth={1.5}
        />
      )}

      <div className="relative flex items-start justify-between">
        <div
          className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconBg}`}
        >
          {Icon && (
            <Icon className={`h-5 w-5 ${theme.iconColor}`} strokeWidth={2} />
          )}
          {pulse && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
          )}
        </div>

        {trend != null && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="relative mt-4 text-sm text-gray-500">{label}</p>
      <p className="relative mt-1 text-2xl font-bold tracking-tight text-gray-900">
        {loading ? (
          <span className="inline-block h-7 w-20 animate-pulse rounded bg-gray-100" />
        ) : (
          <>
            {prefix}
            {display.toLocaleString()}
            {suffix}
          </>
        )}
      </p>
      {sublabel && !loading && (
        <p className="relative mt-1 text-xs text-gray-400">{sublabel}</p>
      )}

      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100 ${theme.bar}`}
      />
    </div>
  );
}
