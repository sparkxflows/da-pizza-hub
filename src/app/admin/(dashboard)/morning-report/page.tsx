"use client";

import { useEffect, useState } from "react";
import {
  Sunrise,
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Users,
  XCircle,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/format";
import { buildMorningReportText } from "@/lib/whatsapp";

interface MorningReportResponse {
  success: boolean;
  reportDate: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  newCustomers: number;
  repeatCustomers: number;
  cancelledOrders: number;
  topItems: { name: string; quantity: number }[];
  branchBreakdown: { branchId: string; revenue: number; orders: number }[];
  message?: string;
}

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
    <div className="rounded-3xl border border-white/10 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-muted">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-secondary">{sub}</p>}
    </div>
  );
}

export default function AdminMorningReportPage() {
  const [report, setReport] = useState<MorningReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/reports/morning");
        const json: MorningReportResponse = await res.json();
        if (!json.success) {
          setError(json.message ?? "Failed to load the morning report.");
          return;
        }
        setReport(json);
      } catch {
        setError("Failed to load the morning report.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formattedDate = report?.reportDate
    ? new Date(report.reportDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const waUrl =
    report && report.reportDate
      ? `https://wa.me/?text=${encodeURIComponent(
          buildMorningReportText({
            reportDate: report.reportDate,
            revenue: report.revenue,
            orders: report.orders,
            averageOrderValue: report.averageOrderValue,
            newCustomers: report.newCustomers,
            repeatCustomers: report.repeatCustomers,
            cancelledOrders: report.cancelledOrders,
            topItems: report.topItems,
            branchBreakdown: report.branchBreakdown,
          })
        )}`
      : undefined;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2">
          <Sunrise size={18} className="text-amber-400" />
          <h1 className="text-lg font-semibold text-white sm:text-xl">
            Morning Report
          </h1>
        </div>
        <p className="text-xs text-ink-secondary">
          Yesterday&apos;s business summary, ready to share
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
            Loading yesterday&apos;s numbers...
          </div>
        ) : report && report.reportDate ? (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-secondary">{formattedDate}</p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1EBE57]"
              >
                <MessageCircle size={16} /> Send to WhatsApp
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={<TrendingUp size={18} className="text-emerald-400" />}
                label="Revenue"
                value={formatCurrency(report.revenue)}
              />
              <MetricCard
                icon={<ShoppingBag size={18} className="text-accent" />}
                label="Orders"
                value={`${report.orders}`}
                sub={`avg ${formatCurrency(report.averageOrderValue)}`}
              />
              <MetricCard
                icon={<Users size={18} className="text-blue-400" />}
                label="Customers"
                value={`${report.newCustomers} new`}
                sub={`${report.repeatCustomers} repeat`}
              />
              <MetricCard
                icon={<XCircle size={18} className="text-red-400" />}
                label="Cancelled"
                value={`${report.cancelledOrders}`}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-card p-6">
                <h2 className="mb-4 font-semibold text-white">Top Items</h2>
                {report.topItems.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-secondary">
                    No orders yesterday.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {report.topItems.map((item, idx) => (
                      <div
                        key={item.name}
                        className="flex justify-between text-sm"
                      >
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
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-card p-6">
                <h2 className="mb-4 font-semibold text-white">Store Revenue</h2>
                {report.branchBreakdown.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-secondary">
                    No orders yesterday.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {report.branchBreakdown.map((b) => (
                      <div
                        key={b.branchId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-white/80">{b.branchId}</span>
                        <span className="text-white/50">
                          {formatCurrency(b.revenue)} · {b.orders} orders
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="py-24 text-center text-ink-secondary">
            No orders yet — the report will populate once orders come in.
          </div>
        )}
      </div>
    </div>
  );
}
