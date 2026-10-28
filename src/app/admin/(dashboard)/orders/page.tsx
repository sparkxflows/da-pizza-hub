"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Store,
  Printer,
  Volume2,
  VolumeX,
  BellRing,
  CheckCircle2,
  Flame,
  Truck,
  Send,
  X,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { adminFetch } from "@/lib/admin-client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  buildCustomerConfirmationText,
  buildGeneralWhatsAppUrl,
  formatIndianWhatsAppNumber,
} from "@/lib/whatsapp";

const STATUS_TABS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  new: "bg-accent/15 text-accent border-accent/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  out_for_delivery: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

function playKitchenAlertSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    // 3-tone urgent upbeat kitchen notification chime
    playTone(659.25, 0, 0.22); // E5
    playTone(880.0, 0.14, 0.22); // A5
    playTone(1318.5, 0.28, 0.45); // E6
  } catch {
    // audio context blocked by browser policy until user interacts
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  // Audio Alerts State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastNewOrdersCountRef = useRef(0);

  // Print Receipt Modal
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [printType, setPrintType] = useState<"kot" | "bill">("kot");

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await adminFetch("/api/admin/orders");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load orders.");
        return;
      }
      const fetchedOrders: Order[] = data.orders || [];
      setOrders(fetchedOrders);
      setError(null);

      // Check for new orders to trigger audio alert
      const currentNew = fetchedOrders.filter((o) => o.status === "new").length;
      if (currentNew > 0 && currentNew !== lastNewOrdersCountRef.current) {
        playKitchenAlertSound();
      }
      lastNewOrdersCountRef.current = currentNew;
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = window.setInterval(() => fetchOrders(), 12000);
    return () => window.clearInterval(id);
  }, [fetchOrders]);

  // Periodic siren sound if new orders are pending and sound is enabled
  useEffect(() => {
    if (!soundEnabled) return;
    const interval = window.setInterval(() => {
      const hasPendingNew = orders.some((o) => o.status === "new");
      if (hasPendingNew) {
        playKitchenAlertSound();
      }
    }, 6000);
    return () => window.clearInterval(interval);
  }, [orders, soundEnabled]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    await adminFetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
  }

  function handleTriggerPrint(ord: Order, type: "kot" | "bill") {
    setPrintOrder(ord);
    setPrintType(type);
  }

  function handlePrintWindow() {
    window.print();
  }

  function handleRiderWhatsApp(ord: Order) {
    const text = `*🍕 DA PIZZA HUB HANSI - DELIVERY ORDER DISPATCH*\n` +
      `*Order:* #${ord.orderNumber}\n` +
      `*Customer:* ${ord.customerName}\n` +
      `*Phone:* +91 ${ord.customerPhone}\n` +
      `*Address:* ${ord.deliveryAddress}\n` +
      `*Payment:* ${ord.paymentMethod.toUpperCase()} (Collect ₹${ord.total})\n\n` +
      `*Items:*\n` +
      ord.items.map((i) => `• ${i.quantity}x ${i.name} ${i.customizationSummary ? `(${i.customizationSummary})` : ""}`).join("\n") +
      `\n\n*Store:* Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi (9911273199)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const newOrdersList = orders.filter((o) => o.status === "new");
  const filtered = orders.filter((o) => {
    return statusFilter === "all" || o.status === statusFilter;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Print CSS Styles for 58mm/80mm Thermal Receipts */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt-area,
          #thermal-receipt-area * {
            visibility: visible;
          }
          #thermal-receipt-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 78mm !important;
            margin: 0 !important;
            padding: 8px !important;
            color: #000 !important;
            background: #fff !important;
            font-family: monospace !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">
              Kitchen &amp; Order Dashboard
            </h1>
            <p className="text-xs text-ink-secondary mt-0.5">
              {filtered.length} order{filtered.length === 1 ? "" : "s"} shown · auto-refreshes every 12s
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Alert Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playKitchenAlertSound();
              }}
              className={`flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${
                soundEnabled
                  ? "border-[#F6C453]/40 bg-[#F6C453]/15 text-[#F6C453]"
                  : "border-white/10 bg-white/5 text-white/50 hover:text-white"
              }`}
              title={soundEnabled ? "Mute kitchen sound alerts" : "Enable kitchen sound alerts"}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{soundEnabled ? "Siren ON" : "Muted"}</span>
            </button>

            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.key === "all"
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-ink-secondary hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-black/15 text-black" : "bg-white/10 text-white"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* NEW ORDERS SIREN ALERT BANNER */}
        {newOrdersList.length > 0 && (
          <div className="mb-6 animate-pulse rounded-3xl border border-red-500/50 bg-gradient-to-r from-red-600/25 via-[#D91F26]/30 to-orange-500/25 p-5 shadow-[0_10px_35px_rgba(217,31,38,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D91F26] text-white shadow-xl animate-bounce">
                  <BellRing size={24} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🚨 {newOrdersList.length} NEW ORDER{newOrdersList.length > 1 ? "S" : ""} WAITING!
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Latest: <strong>#{newOrdersList[0].orderNumber}</strong> ({formatCurrency(newOrdersList[0].total)}) · {newOrdersList[0].deliveryAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={playKitchenAlertSound}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  <Volume2 size={14} /> Ring Chime
                </button>
                <button
                  onClick={() => changeStatus(newOrdersList[0].id, "preparing")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition"
                >
                  <Flame size={15} />
                  Accept &amp; Bake in Oven 🍕
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">
            Loading Hansi kitchen orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-ink-secondary">
            No orders match this filter.
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((ord) => {
              const confirmMsg = buildCustomerConfirmationText({
                customerName: ord.customerName,
                orderNumber: ord.orderNumber,
                items: ord.items,
                total: ord.total,
                orderType: ord.orderType,
                branchName: ord.branchId,
              });
              const waUrl = buildGeneralWhatsAppUrl(
                formatIndianWhatsAppNumber(ord.customerPhone),
                confirmMsg
              );

              return (
                <div
                  key={ord.id}
                  className={`rounded-3xl border transition shadow-lg ${
                    ord.status === "new"
                      ? "border-red-500/40 bg-gradient-to-b from-[#1c1212] to-[#141414]"
                      : "border-white/10 bg-card"
                  } p-5 sm:p-6`}
                >
                  {/* Top Row: Order ID, Status, Store, Payment */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-lg font-bold text-white">
                          #{ord.orderNumber}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase ${STATUS_BADGE[ord.status]}`}
                        >
                          {STATUS_LABEL[ord.status]}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-[#F6C453]">
                          <Store size={12} />
                          Hansi Store
                        </span>
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-mono uppercase text-ink-secondary">
                          {ord.paymentMethod}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {formatDateTime(ord.createdAt)}
                        </span>
                        {ord.scheduleMode === "scheduled" && ord.scheduledFor && (
                          <span className="text-[#F6C453] font-medium">
                            Scheduled: {formatDateTime(ord.scheduledFor)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-white/50 uppercase tracking-wider">
                        Total Amount
                      </span>
                      <p className="font-mono text-xl font-bold text-white">
                        {formatCurrency(ord.total)}
                      </p>
                      {ord.discount > 0 && (
                        <p className="text-[11px] text-emerald-400">
                          Saved {formatCurrency(ord.discount)} {ord.couponCode ? `(${ord.couponCode})` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer and Items Grid */}
                  <div className="mt-4 grid gap-4 border-t border-white/5 pt-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">
                        Customer &amp; Delivery
                      </p>
                      <p className="font-medium text-white">{ord.customerName}</p>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#F6C453] hover:underline"
                      >
                        <Phone size={13} /> +91 {ord.customerPhone}
                      </a>
                      {ord.deliveryAddress && (
                        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-secondary">
                          <MapPin size={14} className="mt-0.5 shrink-0 text-[#D91F26]" />
                          <span>{ord.deliveryAddress}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">
                        Ordered Items
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {ord.items.map((item, idx) => (
                          <li
                            key={item.lineId || idx}
                            className="flex justify-between gap-2"
                          >
                            <span className="text-white/85">
                              <strong className="text-[#F6C453] font-mono mr-1.5">{item.quantity}×</strong>
                              {item.name}
                              {item.customizationSummary && (
                                <span className="block text-xs text-ink-muted">
                                  {item.customizationSummary}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 font-mono text-white/70">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Bar: Status buttons, Thermal Print, WhatsApp */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                    {/* Status Workflow Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {ord.status === "new" && (
                        <button
                          onClick={() => changeStatus(ord.id, "preparing")}
                          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition"
                        >
                          <Flame size={14} /> Accept &amp; Start Baking
                        </button>
                      )}
                      {ord.status === "preparing" && (
                        <button
                          onClick={() => changeStatus(ord.id, "out_for_delivery")}
                          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition"
                        >
                          <Truck size={14} /> Handover to Rider
                        </button>
                      )}
                      {ord.status === "out_for_delivery" && (
                        <button
                          onClick={() => changeStatus(ord.id, "completed")}
                          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition"
                        >
                          <CheckCircle2 size={14} /> Mark Delivered
                        </button>
                      )}

                      {/* Status Pills */}
                      {(
                        [
                          "new",
                          "preparing",
                          "out_for_delivery",
                          "completed",
                          "cancelled",
                        ] as OrderStatus[]
                      ).map((st) => (
                        <button
                          key={st}
                          onClick={() => changeStatus(ord.id, st)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            ord.status === st
                              ? "bg-white/20 text-white border border-white/30"
                              : "border border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {STATUS_LABEL[st]}
                        </button>
                      ))}
                    </div>

                    {/* Print & Dispatch Tools */}
                    <div className="flex items-center gap-2">
                      {/* Thermal KOT Print */}
                      <button
                        onClick={() => handleTriggerPrint(ord, "kot")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                        title="Print Kitchen Order Ticket"
                      >
                        <Printer size={13} className="text-[#F6C453]" />
                        KOT
                      </button>

                      {/* Thermal Customer Bill Print */}
                      <button
                        onClick={() => handleTriggerPrint(ord, "bill")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                        title="Print POS Customer Bill"
                      >
                        <Printer size={13} className="text-white/70" />
                        Bill
                      </button>

                      {/* WhatsApp to Rider */}
                      <button
                        onClick={() => handleRiderWhatsApp(ord)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
                        title="Send Order details to Rider on WhatsApp"
                      >
                        <Send size={13} /> Rider
                      </button>

                      {/* WhatsApp to Customer */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/30 bg-[#25D366]/15 px-3.5 py-1.5 text-xs font-semibold text-[#25D366] transition hover:bg-[#25D366]/25"
                      >
                        <MessageCircle size={13} /> Customer
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* THERMAL PRINT MODAL (58mm / 80mm POS Roll Format) */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#161616] p-6 shadow-2xl">
            <button
              onClick={() => setPrintOrder(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setPrintType("kot")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  printType === "kot"
                    ? "bg-[#D91F26] text-white"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                🍳 Kitchen KOT
              </button>
              <button
                onClick={() => setPrintType("bill")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  printType === "bill"
                    ? "bg-[#D91F26] text-white"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                🧾 Customer Bill
              </button>
            </div>

            {/* Receipt Preview Canvas */}
            <div
              id="thermal-receipt-area"
              className="rounded-2xl border border-dashed border-neutral-300 bg-white p-5 font-mono text-black shadow-inner"
            >
              <div className="text-center pb-3 border-b border-dashed border-neutral-400">
                <h2 className="text-base font-extrabold tracking-tight">DA PIZZA HUB</h2>
                <p className="text-[10px] text-neutral-600">100% PURE VEG PIZZERIA</p>
                <p className="text-[10px] text-neutral-600">
                  Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi (125033)
                </p>
                <p className="text-[10px] text-neutral-700">Phone: +91 99112 73199</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>ORDER: #{printOrder.orderNumber}</span>
                  <span className="uppercase">{printType === "kot" ? "[KITCHEN TICKET]" : "[TAX INVOICE]"}</span>
                </div>
                <div className="flex justify-between text-neutral-600 text-[10px]">
                  <span>{new Date(printOrder.createdAt).toLocaleDateString("en-IN")}</span>
                  <span>{new Date(printOrder.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div className="pt-1">
                  <p><strong>Customer:</strong> {printOrder.customerName}</p>
                  <p><strong>Phone:</strong> {printOrder.customerPhone}</p>
                  <p className="text-[10px] leading-tight"><strong>Address:</strong> {printOrder.deliveryAddress}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2.5 border-b border-dashed border-neutral-400">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-neutral-300 text-[10px] text-neutral-600">
                      <th className="text-left pb-1">ITEM</th>
                      <th className="text-center pb-1">QTY</th>
                      <th className="text-right pb-1">PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {printOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">
                          <span className="font-bold">{item.name}</span>
                          {item.customizationSummary && (
                            <span className="block text-[9px] text-neutral-500 leading-tight">
                              {item.customizationSummary}
                            </span>
                          )}
                        </td>
                        <td className="py-1 text-center font-bold">{item.quantity}</td>
                        <td className="py-1 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-2 text-[11px] space-y-1">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(printOrder.subtotal)}</span>
                </div>
                {printOrder.discount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(printOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(printOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-neutral-300 pt-1">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(printOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-600">
                  <span>Payment:</span>
                  <span className="uppercase font-bold">{printOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-neutral-400 text-center text-[10px] text-neutral-500">
                <p>Fresh Dough • 100% Real Cheese</p>
                <p>Thank you for ordering with Da Pizza Hub Hansi!</p>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setPrintOrder(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handlePrintWindow}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition"
              >
                <Printer size={15} />
                Print POS Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
