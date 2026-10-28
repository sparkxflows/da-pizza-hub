"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Users,
  XCircle,
  Banknote,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/format";

interface DailyReportResponse {
  success: boolean;
  period: string;
  periodLabel: string;
  reportDate: string;
  revenue: number;
  codRevenue: number;
  upiRevenue: number;
  orders: number;
  averageOrderValue: number;
  newCustomers: number;
  repeatCustomers: number;
  cancelledOrders: number;
  topItems: { name: string; quantity: number }[];
  branchBreakdown: { branchId: string; revenue: number; orders: number }[];
  message?: string;
}

const PERIODS = [
  { key: "today", label: "Today (Per Day)" },
  { key: "week", label: "This Week (Per Week)" },
  { key: "month", label: "This Month (Per Month)" },
  { key: "yesterday", label: "Yesterday" },
];

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-5 shadow-lg">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-muted">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-secondary">{sub}</p>}
    </div>
  );
}

export default function AdminDailyReportsPage() {
  const [period, setPeriod] = useState("today");
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (selectedPeriod: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/reports/morning?period=${selectedPeriod}`);
      const json: DailyReportResponse = await res.json();
      if (!json.success) {
        setError(json.message ?? "Failed to load the daily report.");
        return;
      }
      setReport(json);
      setError(null);
    } catch {
      setError("Failed to load the daily report.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(period);
  }, [period, fetchReport]);

  const waReportText = report
    ? `*📊 DA PIZZA HUB — ${report.periodLabel.toUpperCase()} REPORT*\n\n` +
      `💰 *Total Revenue:* ${formatCurrency(report.revenue)}\n` +
      `💵 *COD Cash:* ${formatCurrency(report.codRevenue || 0)}\n` +
      `💳 *UPI / Online:* ${formatCurrency(report.upiRevenue || 0)}\n` +
      `📦 *Total Orders:* ${report.orders}\n` +
      `🎯 *Avg Order Value:* ${formatCurrency(report.averageOrderValue)}\n` +
      `👥 *New Customers:* ${report.newCustomers}\n` +
      `🔁 *Repeat Customers:* ${report.repeatCustomers}\n` +
      `❌ *Cancelled Orders:* ${report.cancelledOrders}\n\n` +
      `🍕 *Top Sellers:*\n` +
      report.topItems.map((item, idx) => `${idx + 1}. ${item.name} (${item.quantity} sold)`).join("\n") +
      `\n\n_Generated automatically from Da Pizza Hub Staff Portal_`
    : "";

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-[#F6C453]" />
              <h1 className="text-lg font-semibold text-white sm:text-xl">
                Daily &amp; Period Reports
              </h1>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Track business performance per day, per week, or per month
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReport(period, true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {report && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(waReportText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
              >
                <MessageCircle size={14} />
                <span>Share on WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                period === p.key
                  ? "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white shadow-md"
                  : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#F6C453]" />
            Loading report for {period}...
          </div>
        ) : (
          report && (
            <div className="space-y-6">
              {/* Primary 4-grid metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  icon={<TrendingUp size={16} className="text-emerald-400" />}
                  label="Revenue"
                  value={formatCurrency(report.revenue)}
                  sub={`COD: ${formatCurrency(report.codRevenue || 0)} · UPI: ${formatCurrency(report.upiRevenue || 0)}`}
                />
                <MetricCard
                  icon={<ShoppingBag size={16} className="text-accent" />}
                  label="Orders Delivered"
                  value={String(report.orders)}
                  sub={`Avg Order: ${formatCurrency(report.averageOrderValue)}`}
                />
                <MetricCard
                  icon={<Users size={16} className="text-[#F6C453]" />}
                  label="Customer Breakdown"
                  value={`${report.newCustomers + report.repeatCustomers} Total`}
                  sub={`${report.newCustomers} New · ${report.repeatCustomers} Returning`}
                />
                <MetricCard
                  icon={<XCircle size={16} className="text-red-400" />}
                  label="Cancelled Orders"
                  value={String(report.cancelledOrders)}
                  sub={
                    report.cancelledOrders === 0
                      ? "100% order fulfillment rate"
                      : "Cancelled by store or user"
                  }
                />
              </div>

              {/* Payment Split & Top Items Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Payment Breakdown Card */}
                <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-xl">
                  <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <Banknote size={18} className="text-[#F6C453]" />
                    Payment Mode Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                          <Banknote size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">Cash on Delivery (COD)</p>
                          <p className="text-xs text-white/50">Cash in hand with riders</p>
                        </div>
                      </div>
                      <p className="font-mono text-xl font-bold text-amber-300">
                        {formatCurrency(report.codRevenue || 0)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">Online / UPI Payments</p>
                          <p className="text-xs text-white/50">Direct bank account settlement</p>
                        </div>
                      </div>
                      <p className="font-mono text-xl font-bold text-emerald-300">
                        {formatCurrency(report.upiRevenue || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Selling Items */}
                <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-xl">
                  <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <Award size={18} className="text-amber-400" />
                    Top Selling Items
                  </h3>

                  {report.topItems.length === 0 ? (
                    <p className="py-8 text-center text-sm text-ink-secondary">
                      No item sales recorded for this period.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {report.topItems.map((item, idx) => (
                        <li
                          key={item.name}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
                        >
                          <span className="flex items-center gap-3 text-white font-medium">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-[#F6C453]">
                              {idx + 1}
                            </span>
                            {item.name}
                          </span>
                          <span className="font-mono font-bold text-accent">
                            {item.quantity} sold
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
