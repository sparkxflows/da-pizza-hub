"use client";

import { useEffect, useState } from "react";
import {
  Award,
  TrendingUp,
  ShoppingBag,
  Banknote,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { formatCurrency, formatDateTime } from "@/lib/format";

interface SalesData {
  success: boolean;
  today: { orders: number; revenue: number };
  week: { orders: number; revenue: number };
  month: { orders: number; revenue: number };
  lifetime: { orders: number; revenue: number };
  payments: {
    cod: { orders: number; revenue: number };
    upi: { orders: number; revenue: number };
  };
  status: {
    new: number;
    preparing: number;
    outForDelivery: number;
    completed: number;
    cancelled: number;
  };
  topItems: { name: string; quantity: number }[];
  recentHistory: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    paymentMethod: "cod" | "upi";
    status: string;
    itemsCount: number;
    createdAt: string;
  }[];
  message?: string;
}

function PeriodSummaryCard({
  label,
  period,
  highlight = false,
}: {
  label: string;
  period: { orders: number; revenue: number };
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-xl transition ${
        highlight
          ? "border-[#F6C453]/40 bg-gradient-to-b from-[#1f1910] to-card"
          : "border-white/10 bg-card"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-ink-muted">{label}</p>
      <div className="mt-3 flex items-center gap-2">
        <TrendingUp size={20} className={highlight ? "text-[#F6C453]" : "text-emerald-400"} />
        <span className="text-2xl font-black text-white font-mono">
          {formatCurrency(period.revenue)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-secondary">
        <ShoppingBag size={13} />
        <span>{period.orders} order{period.orders === 1 ? "" : "s"} delivered</span>
      </div>
    </div>
  );
}

export default function AdminSalesPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/stats");
        const json: SalesData = await res.json();
        if (!json.success) {
          setError(json.message ?? "Failed to load sales data.");
          return;
        }
        setData(json);
      } catch {
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">
              Sales &amp; Lifetime Analytics
            </h1>
            <p className="text-xs text-ink-secondary mt-0.5">
              Comprehensive store revenue, payment modes, and order history
            </p>
          </div>
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
            Loading sales overview...
          </div>
        ) : (
          data && (
            <div className="space-y-6">
              {/* 4 Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <PeriodSummaryCard label="Today (Per Day)" period={data.today} />
                <PeriodSummaryCard label="Last 7 Days (Per Week)" period={data.week} />
                <PeriodSummaryCard label="Last 30 Days (Per Month)" period={data.month} />
                <PeriodSummaryCard label="All-Time Lifetime" period={data.lifetime} highlight />
              </div>

              {/* Payment Mode Distribution & Top Sellers */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Payment Mode Box */}
                <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-xl">
                  <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <Banknote size={18} className="text-[#F6C453]" />
                    Lifetime Payment Collection
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">Cash on Delivery (COD)</p>
                        <p className="text-xs text-white/50">{data.payments.cod.orders} cash orders</p>
                      </div>
                      <p className="font-mono text-xl font-bold text-amber-300">
                        {formatCurrency(data.payments.cod.revenue)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">UPI / Online Prepaid</p>
                        <p className="text-xs text-white/50">{data.payments.upi.orders} digital orders</p>
                      </div>
                      <p className="font-mono text-xl font-bold text-emerald-300">
                        {formatCurrency(data.payments.upi.revenue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top 30-Day Sellers */}
                <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-xl">
                  <div className="mb-4 flex items-center gap-2 text-white">
                    <Award size={18} className="text-amber-400" />
                    <h3 className="font-bold text-base">Top Items Sold (Last 30 Days)</h3>
                  </div>

                  {data.topItems.length === 0 ? (
                    <p className="py-8 text-center text-sm text-ink-secondary">
                      No items sold yet in the last 30 days.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.topItems.slice(0, 5).map((item, idx) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs"
                        >
                          <span className="flex items-center gap-2 font-medium text-white">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#F6C453]">
                              {idx + 1}
                            </span>
                            {item.name}
                          </span>
                          <span className="font-mono font-bold text-accent">
                            {item.quantity} sold
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comprehensive Order History Table */}
              <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Calendar size={18} className="text-[#F6C453]" />
                    Order History Log (Recent 50 Orders)
                  </h3>
                  <span className="text-xs text-white/50">
                    {data.recentHistory?.length || 0} orders shown
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Order</th>
                        <th className="pb-3 font-semibold">Date &amp; Time</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Payment</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {data.recentHistory?.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/5 transition">
                          <td className="py-3 font-mono font-bold text-white">
                            #{ord.orderNumber}
                          </td>
                          <td className="py-3 text-white/50">
                            {formatDateTime(ord.createdAt)}
                          </td>
                          <td className="py-3 font-medium text-white">
                            {ord.customerName}
                            <span className="block text-[11px] text-white/40">
                              +91 {ord.customerPhone}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                ord.paymentMethod === "cod"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-emerald-500/15 text-emerald-400"
                              }`}
                            >
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="capitalize text-[11px] font-medium text-white/70">
                              {ord.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-white">
                            {formatCurrency(ord.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
