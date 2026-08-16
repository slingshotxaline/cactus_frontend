"use client";

import { useState } from "react";
import {
  useGetTrafficSummaryQuery,
  useGetDailyTrafficQuery,
  useGetTopPagesQuery,
  useGetTopClicksQuery,
  useGetDeviceBreakdownQuery,
  useGetEventLogQuery,
} from "../../../features/traffic/trafficApi";
import { cleanParams } from "../../../lib/queryParams";

const DEVICE_META = {
  desktop: { label: "Desktop", color: "#6D5EF5" },
  mobile: { label: "Mobile", color: "#F5A524" },
  tablet: { label: "Tablet", color: "#94A3B8" },
};

const TYPE_FILTERS = [
  { value: "", label: "All events" },
  { value: "page_view", label: "Page views" },
  { value: "click", label: "Clicks" },
];

/* ---------- small inline icons (no extra deps) ---------- */
const Icon = {
  Eye: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...p}
    >
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  ),
  Users: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...p}
    >
      <circle cx="9" cy="8" r="3.25" />
      <path
        d="M2.5 20c.9-3.6 3.4-5.5 6.5-5.5s5.6 1.9 6.5 5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 8.25a3 3 0 1 1 3.4 2.97" strokeLinecap="round" />
      <path d="M15.5 14.7c2.6.2 4.6 2 5.3 5.3" strokeLinecap="round" />
    </svg>
  ),
  Calendar: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...p}
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  Chevron: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      {...p}
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ---------- stat card with a mini sparkline ---------- */
function StatCard({ icon, label, value, sublabel, spark }) {
  const max = Math.max(...(spark?.length ? spark : [0]), 1);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-400">
            {icon}
            <span className="text-xs font-medium uppercase tracking-wide">
              {label}
            </span>
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {Number(value ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">{sublabel}</div>
        </div>
      </div>
      {!!spark?.length && (
        <div className="mt-4 flex h-8 items-end gap-1">
          {spark.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-brand-500/25"
              style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
            />
          ))}
        </div>
      )}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/5" />
    </div>
  );
}

/* ---------- ranked list row with an inline progress bar ---------- */
function RankRow({ index, label, value, max, mono }) {
  const pct = Math.max((value / max) * 100, 2);
  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="w-5 shrink-0 text-right text-xs font-medium text-slate-300">
            {index + 1}
          </span>
          <span
            className={`truncate text-slate-600 ${
              mono ? "font-mono text-xs" : ""
            }`}
            title={label}
          >
            {label}
          </span>
        </div>
        <span className="shrink-0 font-semibold text-slate-900">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="ml-[26px] mt-1.5 h-1.5 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminTrafficPage() {
  const [logType, setLogType] = useState("");
  const [logPage, setLogPage] = useState(1);

  const { data: summaryData, isLoading: isLoadingSummary } =
    useGetTrafficSummaryQuery();
  const { data: dailyData } = useGetDailyTrafficQuery(14);
  const { data: topPagesData } = useGetTopPagesQuery(30);
  const { data: topClicksData } = useGetTopClicksQuery(30);
  const { data: deviceData } = useGetDeviceBreakdownQuery(30);
  const { data: logData, isLoading: isLoadingLog } = useGetEventLogQuery(
    cleanParams({ type: logType, page: logPage, limit: 30 })
  );

  const summary = summaryData?.data;
  const daily = dailyData?.data || [];
  const topPages = topPagesData?.data || [];
  const topClicks = topClicksData?.data || [];
  const devices = deviceData?.data || [];
  const logs = logData?.data || [];
  const logPagination = logData?.pagination;

  const maxDailyViews = Math.max(...daily.map((d) => d.views), 1);
  const totalDeviceViews = devices.reduce((sum, d) => sum + d.views, 0) || 1;
  const maxTopPage = Math.max(...topPages.map((p) => p.views), 1);
  const maxTopClick = Math.max(...topClicks.map((c) => c.clicks), 1);
  const sparkViews = daily.slice(-7).map((d) => d.views);

  // build a smooth-ish area path for the daily views chart
  const chartW = 700;
  const chartH = 180;
  const points = daily.map((d, i) => {
    const x = daily.length > 1 ? (i / (daily.length - 1)) * chartW : chartW / 2;
    const y = chartH - (d.views / maxDailyViews) * (chartH - 20) - 4;
    return { x, y, d };
  });
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(
        1
      )} ${chartH} L ${points[0].x.toFixed(1)} ${chartH} Z`
    : "";

  // device donut via conic-gradient
  let cumulative = 0;
  const donutStops = devices.map((d) => {
    const start = cumulative;
    const pct = (d.views / totalDeviceViews) * 100;
    cumulative += pct;
    const color = DEVICE_META[d.device]?.color || "#CBD5E1";
    return `${color} ${start}% ${cumulative}%`;
  });
  const donutBg = donutStops.length
    ? `conic-gradient(${donutStops.join(", ")})`
    : "#F1F5F9";

  return (
    <div className="min-h-full bg-slate-50/60 pb-12">
      {/* header */}
      <div className="mb-7 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Site Traffic
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            How many people visit the storefront, which pages they land on, and
            which banners, sections, or products they actually click.
          </p>
        </div>
      </div>

      {/* stat cards */}
      {isLoadingSummary ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Icon.Eye className="h-4 w-4" />}
            label="Views today"
            value={summary?.today?.views}
            sublabel={`${(
              summary?.today?.uniqueVisitors ?? 0
            ).toLocaleString()} unique visitors`}
            spark={sparkViews}
          />
          <StatCard
            icon={<Icon.Calendar className="h-4 w-4" />}
            label="Views · 7 days"
            value={summary?.last7Days?.views}
            sublabel={`${(
              summary?.last7Days?.uniqueVisitors ?? 0
            ).toLocaleString()} unique visitors`}
            spark={sparkViews}
          />
          <StatCard
            icon={<Icon.Users className="h-4 w-4" />}
            label="Views · 30 days"
            value={summary?.last30Days?.views}
            sublabel={`${(
              summary?.last30Days?.uniqueVisitors ?? 0
            ).toLocaleString()} unique visitors`}
            spark={sparkViews}
          />
        </div>
      )}

      {/* daily views chart */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Daily views — last 14 days
          </h2>
          <span className="text-xs text-slate-400">
            Peak {maxDailyViews.toLocaleString()}
          </span>
        </div>
        {daily.length === 0 ? (
          <p className="text-sm text-slate-400">No traffic recorded yet.</p>
        ) : (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full"
              preserveAspectRatio="none"
              style={{ height: 180 }}
            >
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D5EF5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6D5EF5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="0"
                  x2={chartW}
                  y1={chartH * f}
                  y2={chartH * f}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
              ))}
              {areaPath && <path d={areaPath} fill="url(#areaFill)" />}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#6D5EF5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {points.map((p, i) => (
                <g key={i} className="group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10"
                    fill="transparent"
                    className="cursor-pointer"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="#6D5EF5"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </g>
              ))}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              {daily.map((d, i) => (
                <span
                  key={d.date}
                  className={
                    i % 2 === 0 || daily.length < 10 ? "" : "hidden sm:inline"
                  }
                >
                  {d.date.slice(5)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* top pages / top clicks */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">
            Top pages
          </h2>
          <p className="mb-3 text-xs text-slate-400">Last 30 days</p>
          <div className="divide-y divide-slate-50">
            {topPages.map((p, i) => (
              <RankRow
                key={p.path}
                index={i}
                label={p.path}
                value={p.views}
                max={maxTopPage}
                mono
              />
            ))}
            {topPages.length === 0 && (
              <p className="text-sm text-slate-400">No page views yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">
            Most clicked
          </h2>
          <p className="mb-3 text-xs text-slate-400">Last 30 days</p>
          <div className="divide-y divide-slate-50">
            {topClicks.map((c, i) => (
              <RankRow
                key={c.label}
                index={i}
                label={c.label}
                value={c.clicks}
                max={maxTopClick}
                mono
              />
            ))}
            {topClicks.length === 0 && (
              <p className="text-sm text-slate-400">No clicks recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* device breakdown */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">
          Device breakdown — last 30 days
        </h2>
        {devices.length === 0 ? (
          <p className="text-sm text-slate-400">No data yet.</p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div
              className="relative h-32 w-32 shrink-0 rounded-full"
              style={{ background: donutBg }}
            >
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-lg font-bold text-slate-900">
                  {totalDeviceViews.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">views</span>
              </div>
            </div>
            <div className="w-full flex-1 space-y-3">
              {devices.map((d) => {
                const meta = DEVICE_META[d.device] || {
                  label: d.device,
                  color: "#CBD5E1",
                };
                const pct = Math.round((d.views / totalDeviceViews) * 100);
                return (
                  <div key={d.device}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        {meta.label}
                      </span>
                      <span className="text-slate-500">
                        {d.views.toLocaleString()}{" "}
                        <span className="text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* event log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Full event log
          </h2>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setLogType(f.value);
                  setLogPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  logType === f.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingLog ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-slate-50"
              />
            ))}
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2.5 font-medium">When</th>
                    <th className="py-2.5 font-medium">Type</th>
                    <th className="py-2.5 font-medium">Path</th>
                    <th className="py-2.5 font-medium">Label</th>
                    <th className="py-2.5 font-medium">Device</th>
                    <th className="py-2.5 font-medium">User</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-slate-50 hover:bg-slate-50/60"
                    >
                      <td className="py-2.5 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            log.type === "click"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-brand-500/10 text-brand-600"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate py-2.5 font-mono text-xs text-slate-600">
                        {log.path}
                      </td>
                      <td className="max-w-[180px] truncate py-2.5 font-mono text-xs text-slate-600">
                        {log.label || "—"}
                      </td>
                      <td className="py-2.5 text-slate-400">{log.device}</td>
                      <td className="py-2.5 text-slate-400">
                        {log.user?.name || "Guest"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400"
                      >
                        No events yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* mobile cards */}
            <div className="space-y-2 md:hidden">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="rounded-xl border border-slate-100 p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.type === "click"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-brand-500/10 text-brand-600"
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="truncate font-mono text-xs text-slate-600">
                    {log.path}
                  </div>
                  {log.label && (
                    <div className="truncate font-mono text-xs text-slate-400">
                      {log.label}
                    </div>
                  )}
                  <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                    <span>{log.device}</span>
                    <span>{log.user?.name || "Guest"}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  No events yet.
                </p>
              )}
            </div>

            {logPagination && logPagination.pages > 1 && (
              <div className="mt-5 flex items-center justify-between">
                <button
                  disabled={logPage <= 1}
                  onClick={() => setLogPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Icon.Chevron className="h-3.5 w-3.5 rotate-180" />
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {logPagination.page} of {logPagination.pages}
                </span>
                <button
                  disabled={logPage >= logPagination.pages}
                  onClick={() => setLogPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next
                  <Icon.Chevron className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
