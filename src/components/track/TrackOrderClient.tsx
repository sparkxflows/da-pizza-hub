"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bike,
  Phone,
  MessageCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import type { Branch, Order } from "@/lib/types";
import {
  LiveOrderTracker,
  type LiveOrderDetails,
} from "@/components/track/LiveOrderTracker";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

export function TrackOrderClient({ primaryBranch }: { primaryBranch: Branch }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<LiveOrderDetails | null>(null);
  const [cachedOrderId, setCachedOrderId] = useState<string | null>(null);

  // Auto-detect last order from session/local storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("dph_last_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.orderId) {
          setCachedOrderId(parsed.orderId);
          // Auto load last active order if within 3 hours
          const placedAt = parsed.placedAt || Date.now();
          if (Date.now() - placedAt < 3 * 3600 * 1000) {
            setActiveOrder({
              orderId: parsed.orderId,
              name: parsed.name,
              phone: parsed.phone,
              address: parsed.address,
              branch: primaryBranch,
              placedAt: parsed.placedAt,
              total: parsed.total,
              orderType: "delivery",
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }, [primaryBranch]);

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (!q) {
      setError("Please enter your Order ID (e.g. DPH-7245) or 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isPhone = /^[6-9]\d{9}$/.test(q);
      const param = isPhone ? `phone=${encodeURIComponent(q)}` : `orderNumber=${encodeURIComponent(q)}`;
      const res = await fetch(`/api/orders?${param}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        setError(
          data?.message ||
            "No active order found. Please verify your order details or contact our Hansi store."
        );
        setLoading(false);
        return;
      }

      const o: Order = data.order;
      const b: Branch = data.branch || primaryBranch;

      setActiveOrder({
        orderId: o.orderNumber,
        name: o.customerName,
        phone: o.customerPhone,
        address: o.deliveryAddress,
        branch: b,
        placedAt: new Date(o.createdAt).getTime(),
        total: o.total,
        status: o.status,
        orderType: o.orderType,
        customerLat: o.customerLat,
        customerLng: o.customerLng,
      });
    } catch {
      setError("Unable to connect to order server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg pt-28 pb-24 text-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F6C453]/30 bg-[#F6C453]/10 px-4 py-1.5 text-xs font-bold text-[#F6C453] mb-4">
            <Bike size={14} /> LIVE PIZZA TRACKER
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/60">
            Real-time status from Da Pizza Hub kitchen straight to your doorstep.
          </p>
        </div>

        {/* Quick Active Order chip if available */}
        {!activeOrder && cachedOrderId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 text-white/80">
              <Clock size={15} className="text-[#F6C453]" />
              <span>
                Recent order in browser: <strong className="text-white font-mono">{cachedOrderId}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setQuery(cachedOrderId);
                handleSearch(cachedOrderId);
              }}
              className="font-bold text-[#F6C453] hover:underline flex items-center gap-1"
            >
              Track Now <ArrowRight size={12} />
            </button>
          </motion.div>
        )}

        {/* Search bar card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl shadow-2xl mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter Order ID (e.g. DPH-7245) or Phone"
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#F6C453] focus:ring-1 focus:ring-[#F6C453]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-14 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-7 font-bold text-white transition hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none shadow-[0_10px_25px_rgba(217,31,38,0.4)]"
            >
              {loading ? "Checking..." : "Track Order"}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300"
            >
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Active Live Tracker Display */}
        <AnimatePresence mode="wait">
          {activeOrder && (
            <motion.div
              key={activeOrder.orderId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-white/50">Tracking Order</span>
                <button
                  onClick={() => {
                    setActiveOrder(null);
                    setQuery("");
                  }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition"
                >
                  <RotateCcw size={13} /> Track Different Order
                </button>
              </div>

              <LiveOrderTracker order={activeOrder} />

              {/* Direct Store Helpline Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`tel:+91${primaryBranch.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  <Phone size={16} className="text-[#F6C453]" /> Call Hansi Kitchen (+91 {primaryBranch.phone})
                </a>
                <a
                  href={buildGeneralWhatsAppUrl(
                    primaryBranch.whatsapp,
                    `Hello Da Pizza Hub Hansi, I want to inquire about my order #${activeOrder.orderId}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366] text-sm font-bold text-white hover:bg-[#20BD5C] transition shadow-[0_10px_25px_rgba(37,211,102,0.3)]"
                >
                  <MessageCircle size={16} /> WhatsApp Store
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help footer card if no active order */}
        {!activeOrder && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-center">
            <h3 className="text-sm font-bold text-white">Need help with an order?</h3>
            <p className="mt-1 text-xs text-white/60 max-w-md mx-auto">
              Our store team is available from 10:30 AM to 10:00 PM at Gandhi Market, Near Ambedkar Chowk, Hansi.
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs font-bold">
              <a
                href={`tel:+91${primaryBranch.phone}`}
                className="text-[#F6C453] hover:underline flex items-center gap-1"
              >
                <Phone size={13} /> +91 {primaryBranch.phone}
              </a>
              <span className="text-white/20">|</span>
              <Link href="/menu" className="text-white hover:underline">
                Explore Menu
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
