"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Clock,
  Banknote,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function DeliveryPanelPage() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    codCollectedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchDeliveryData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/delivery/orders");
      const data = await res.json();
      if (data.success) {
        setActiveOrders(data.active || []);
        setCompletedOrders(data.completedToday || []);
        setStats(
          data.stats || {
            activeCount: 0,
            completedCount: 0,
            codCollectedToday: 0,
          }
        );
      }
    } catch (err) {
      console.error("Failed to load delivery orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryData();
    // Auto-refresh every 15 seconds so riders get new dispatches in real-time
    const interval = setInterval(() => {
      fetchDeliveryData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDeliveryData]);

  async function handleMarkDelivered(order: Order) {
    if (markingId) return;
    setMarkingId(order.id);
    try {
      const res = await fetch("/api/delivery/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          action: "deliver",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessToast(`Order #${order.orderNumber} delivered successfully!`);
        setTimeout(() => setSuccessToast(null), 3000);
        await fetchDeliveryData();
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white pb-24 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-sm rounded-2xl bg-emerald-500 text-white px-4 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{successToast}</p>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#141414]/95 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt="Da Pizza Hub"
              width={38}
              height={38}
              className="rounded-full ring-2 ring-[#D91F26]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base leading-none text-white">
                  Da Pizza Hub
                </span>
                <span className="rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold px-1.5 py-0.5">
                  RIDER
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Delivery Boy Dispatch Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDeliveryData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-center">
            <span className="text-[10px] uppercase font-semibold text-sky-300 block">
              To Deliver
            </span>
            <span className="text-2xl font-black text-sky-400 font-mono mt-0.5 block">
              {stats.activeCount}
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
            <span className="text-[10px] uppercase font-semibold text-emerald-300 block">
              Delivered Today
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {stats.completedCount}
            </span>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
            <span className="text-[10px] uppercase font-semibold text-amber-300 block">
              COD Cash In Hand
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              ₹{stats.codCollectedToday}
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1 border border-white/10">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "active"
                ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Truck size={15} />
            <span>Active Deliveries ({activeOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Completed Today ({completedOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        {loading ? (
          <div className="py-20 text-center text-white/50">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-sky-400" />
            <p className="text-sm">Loading delivery orders...</p>
          </div>
        ) : activeTab === "active" ? (
          activeOrders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#141414] py-16 px-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/40">
                <Truck size={28} />
              </div>
              <h3 className="font-bold text-white text-lg">No Active Deliveries</h3>
              <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                All dispatched orders have been delivered! Kitchen will assign new orders when they are baked.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  order.deliveryAddress + ", Hansi"
                )}`;
                const waUrl = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
                  `Hi ${order.customerName}, your Da Pizza Hub order #${order.orderNumber} is on the way!`
                )}`;

                const isCod = order.paymentMethod === "cod";

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border-2 border-sky-500/30 bg-[#161616] p-4 sm:p-5 shadow-xl transition-all"
                  >
                    {/* Top Row: Order Number & Delivery Badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="font-mono text-xl font-black text-white">
                          #{order.orderNumber}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/50 mt-0.5">
                          <Clock size={12} />
                          <span>Dispatched: {formatDateTime(order.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-400 uppercase tracking-wide">
                          Out for Delivery
                        </span>
                      </div>
                    </div>

                    {/* Payment Instruction Banner */}
                    <div className="mt-3">
                      {isCod ? (
                        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3.5 flex items-center justify-between text-amber-300">
                          <div className="flex items-center gap-2">
                            <Banknote size={20} className="text-amber-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">
                                Cash On Delivery (COD)
                              </p>
                              <p className="text-[11px] text-amber-200/80">
                                Collect cash from customer
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black font-mono text-white">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-3.5 flex items-center justify-between text-emerald-300">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider">
                                Paid Online (UPI)
                              </p>
                              <p className="text-[11px] text-emerald-200/80">
                                Payment already verified · Do NOT collect cash
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black font-mono text-white">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer & Location */}
                    <div className="mt-3.5 rounded-2xl bg-white/5 border border-white/5 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-white/50 uppercase font-semibold">
                            Customer
                          </p>
                          <p className="text-base font-bold text-white mt-0.5">
                            {order.customerName}
                          </p>
                        </div>

                        {/* Direct Call & WhatsApp Action Buttons */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
                          >
                            <Phone size={14} />
                            <span>Call</span>
                          </a>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-white/50 uppercase font-semibold mb-1">
                          Delivery Address
                        </p>
                        <p className="text-sm font-medium text-white/90 leading-relaxed">
                          {order.deliveryAddress}
                        </p>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-sky-300 transition"
                        >
                          <Navigation size={13} />
                          <span>Open in Google Maps</span>
                        </a>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="mt-3 rounded-2xl bg-white/5 border border-white/5 p-3">
                      <p className="text-xs text-white/50 uppercase font-semibold mb-1.5">
                        Items to Deliver ({order.items.length})
                      </p>
                      <ul className="space-y-1 text-xs">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-white/85">
                            <span>
                              <strong className="text-amber-400 font-mono mr-1.5">
                                {item.quantity}×
                              </strong>
                              {item.name}
                              {item.customizationSummary && (
                                <span className="text-white/40 block text-[10px]">
                                  {item.customizationSummary}
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-white/60">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* BIG GREEN DELIVERED BUTTON */}
                    <button
                      onClick={() => handleMarkDelivered(order)}
                      disabled={markingId === order.id}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 py-4 text-base font-black text-white shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition hover:brightness-110 disabled:opacity-50"
                    >
                      <CheckCircle2 size={20} />
                      <span>
                        {markingId === order.id
                          ? "Updating Status..."
                          : "MARK AS DELIVERED"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          completedOrders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#141414] py-16 px-4 text-center">
              <h3 className="font-bold text-white text-base">No Deliveries Completed Today</h3>
              <p className="text-xs text-white/50 mt-1">
                Delivered orders will appear here for daily cash reconciliation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-[#141414] p-4 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        #{order.orderNumber}
                      </span>
                      <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        DELIVERED
                      </span>
                    </div>
                    <p className="text-white/80 font-medium mt-1">
                      {order.customerName} · {order.customerPhone}
                    </p>
                    <p className="text-white/50 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                      {order.deliveryAddress}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-white block">
                      {formatCurrency(order.total)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        order.paymentMethod === "cod"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {order.paymentMethod === "cod" ? "COD Collected" : "Paid Online"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Quick return link to admin or storefront */}
      <footer className="mt-8 text-center text-xs text-white/40">
        <Link href="/admin/orders" className="hover:text-white underline">
          Switch to Kitchen Dashboard
        </Link>
      </footer>
    </div>
  );
}
