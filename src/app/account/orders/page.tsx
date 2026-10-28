"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageCheck, Clock, MapPin, Repeat, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Order Received", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  preparing: { label: "Baking in Oven 🍕", color: "text-[#FF6B00]", bg: "bg-[#FF6B00]/10 border-[#FF6B00]/20" },
  out_for_delivery: { label: "Out for Delivery 🛵", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  completed: { label: "Delivered ✅", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

export default function MyOrdersPage() {
  const { customer, openAuthModal } = useCustomerStore();
  const { addLine, openCart } = useCartStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!customer) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/customer/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [customer]);

  function handleReorder(order: Order) {
    order.items.forEach((item) => {
      addLine({
        itemId: item.itemId,
        name: item.name,
        basePrice: item.basePrice,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        image: item.image,
        customization: item.customization,
        customizationSummary: item.customizationSummary,
      });
    });
    openCart();
  }

  if (!customer) {
    return (
      <div className="min-h-[75vh] pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#141414] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-[#F6C453]">
            <PackageCheck size={32} />
          </div>
          <h2 className="font-heading text-3xl font-semibold text-white">Sign In to View Orders</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Sign in with your mobile number or Supabase to see your past orders, active pizza tracking, and bills.
          </p>
          <button
            onClick={() => openAuthModal("phone")}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Sign In with Phone / Supabase
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#F6C453] uppercase">
            Customer Dashboard
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
            My Orders &amp; Bills
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Welcome back, <strong className="text-white">{customer.name || customer.email}</strong> {customer.phone ? `(+91 ${customer.phone})` : `(${customer.email})`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/account/addresses"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Saved Addresses
          </Link>
          <Link
            href="/menu"
            className="rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-2.5 text-xs font-semibold text-white transition hover:scale-105"
          >
            Order Pizza
          </Link>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-white/50">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#141414] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/40">
            <PackageCheck size={32} />
          </div>
          <h3 className="font-heading text-2xl text-white">No Orders Found Yet</h3>
          <p className="mt-2 text-sm text-ink-secondary max-w-md mx-auto">
            You haven't placed any orders with +91 {customer.phone} yet. Order your favorite pizza now!
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
          >
            Browse Menu &amp; Order
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = STATUS_LABELS[order.status] || STATUS_LABELS.new;
            return (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-[#141414] p-6 transition hover:border-white/20 shadow-lg"
              >
                {/* Top Row: Order ID, Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base sm:text-lg font-bold text-white">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.color} ${statusConfig.bg}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Clock size={14} />
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="py-4 space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-bold text-[#F6C453]">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-white">{item.name}</span>
                        {item.customizationSummary && (
                          <span className="text-xs text-ink-secondary hidden sm:inline">
                            ({item.customizationSummary})
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-medium text-white/90">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Bill */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-2 text-xs text-ink-secondary max-w-md">
                    <MapPin size={15} className="text-[#D91F26] shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right mr-2">
                      <span className="block text-[10px] text-white/50 uppercase tracking-wider">
                        Total Bill
                      </span>
                      <span className="font-mono text-lg font-bold text-[#F6C453]">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    {/* Track Live Button */}
                    <Link
                      href={`/track?order=${order.orderNumber}`}
                      className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-[#D91F26]"
                    >
                      <Sparkles size={14} className="text-[#F6C453]" />
                      Track Live
                    </Link>

                    {/* 1-Click Reorder Button */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:scale-105 active:scale-95"
                    >
                      <Repeat size={14} />
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
