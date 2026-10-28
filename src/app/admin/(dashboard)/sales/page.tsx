"use client";

import { useEffect, useState } from "react";
import { Award, TrendingUp, ShoppingBag } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/format";

interface SalesData {
  success: boolean;
  today: { orders: number; revenue: number };
  week: { orders: number; revenue: number };
  month: { orders: number; revenue: number };
  topItems: { name: string; quantity: number }[];
  message?: string;
}

function PeriodSummaryCard({
  label,
  period,
}: {
  label: string;
  period: { orders: number; revenue: number };
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-6">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="mt-3 flex items-center gap-2">
        <TrendingUp size={20} className="text-emerald-400" />
        <span className="text-2xl font-bold text-white">
          {formatCurrency(period.revenue)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
        <ShoppingBag size={14} />
        {period.orders} order{period.orders === 1 ? "" : "s"}
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
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <h1 className="text-lg font-semibold text-white sm:text-xl">Sales</h1>
        <p className="text-xs text-ink-secondary">
          Revenue and order summary
        </p>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">
            Loading sales data...
          </div>
        ) : (
          data && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <PeriodSummaryCard label="Today" period={data.today} />
                <PeriodSummaryCard label="Last 7 Days" period={data.week} />
                <PeriodSummaryCard label="Last 30 Days" period={data.month} />
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-card p-6">
                <div className="mb-4 flex items-center gap-2 text-white">
                  <Award size={18} className="text-amber-400" />
                  <h2 className="font-semibold">Top Sellers (Last 30 Days)</h2>
                </div>

                {data.topItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-secondary">
                    No orders yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.topItems.map((item, idx) => {
                      const maxQty = data.topItems[0].quantity || 1;
                      const pct = Math.max(8, (item.quantity / maxQty) * 100);
                      return (
                        <div key={item.name}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-white/80">
                              <span className="mr-2 text-ink-muted">
                                #{idx + 1}
                              </span>
                              {item.name}
                            </span>
                            <span className="text-white/50">
                              {item.quantity} sold
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-accent to-orange-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
