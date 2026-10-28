"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  Store,
  Wallet,
  MessageCircle,
} from "lucide-react";
import type {
  Branch,
  CartLine,
  PaymentMethod,
  ScheduleMode,
} from "@/lib/types";
import { formatCurrency, formatEstimatedDeliveryWindow } from "@/lib/format";
import { buildGeneralWhatsAppUrl, buildOrderReceiptText } from "@/lib/whatsapp";
import { EXPO_EASE } from "@/components/motion/Reveal";
import {
  LiveOrderTracker,
  type LiveOrderDetails,
} from "@/components/track/LiveOrderTracker";

interface SavedLastOrder {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  branchId: string;
  total: number;
  paymentMethod: PaymentMethod;
  lines: CartLine[];
  placedAt: number;
  scheduleMode: ScheduleMode;
  scheduledFor?: string | null;
}

function SummaryRow({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <span
        className={`text-sm flex items-center gap-1.5 ${
          highlight ? "font-bold text-gold" : "font-medium text-ink-primary"
        }`}
      >
        {icon} {value}
      </span>
    </div>
  );
}

export function OrderConfirmedClient({ branches }: { branches: Branch[] }) {
  const [order, setOrder] = useState<SavedLastOrder | null>(null);
  const [etaWindow] = useState(() => formatEstimatedDeliveryWindow());

  useEffect(() => {
    const raw = sessionStorage.getItem("dph_last_order");
    if (raw) {
      try {
        setOrder(JSON.parse(raw));
      } catch {
        setOrder(null);
      }
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-bg pt-28 pb-24 flex flex-col items-center justify-center text-center px-6">
        <p className="text-ink-secondary mb-6">No recent order found.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/track"
            className="px-6 py-3 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Track Existing Order
          </Link>
          <Link
            href="/menu"
            className="px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-bright transition-colors"
          >
            Order Something
          </Link>
        </div>
      </div>
    );
  }

  // Hansi primary branch
  const branch =
    branches.find((b) => b.id === order.branchId) ??
    branches.find((b) => b.id === "Hansi") ??
    branches[0];

  const receiptText = buildOrderReceiptText(
    order.lines,
    order.total,
    order.orderId
  );
  const whatsappUrl = buildGeneralWhatsAppUrl(branch.whatsapp, receiptText);

  const trackerDetails: LiveOrderDetails = {
    orderId: order.orderId,
    name: order.name,
    phone: order.phone,
    address: order.address,
    branch,
    placedAt: order.placedAt || Date.now() - 3 * 60000,
    total: order.total,
    orderType: "delivery",
  };

  return (
    <div className="min-h-screen bg-bg pt-28 pb-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Celebration Tick Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EXPO_EASE }}
          className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: EXPO_EASE }}
            className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-[0_0_25px_rgba(246,196,83,0.5)]"
          >
            <Check size={28} className="text-bg" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Confirmation Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary">
            Thank you, <span className="font-semibold text-white">{order.name.split(" ")[0]}</span>. Your order is being prepared fresh in our kitchen.
          </p>
        </motion.div>

        {/* LIVE TRACKER COMPONENT (DYNAMIC, TICKING COUNTDOWN, RADAR MAP) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mb-6"
        >
          <LiveOrderTracker order={trackerDetails} />
        </motion.div>

        {/* Order Details Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-card rounded-3xl p-6 border border-white/5 space-y-4 mb-6 text-left"
        >
          <SummaryRow
            label="Order Number"
            value={order.orderId}
            highlight
          />
          <SummaryRow
            label="Estimated Delivery"
            value={
              order.scheduleMode === "scheduled" && order.scheduledFor
                ? new Date(order.scheduledFor).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : etaWindow
            }
            icon={<Clock size={15} className="text-gold" />}
          />
          <SummaryRow
            label="Store"
            value={branch.name}
            icon={<Store size={15} className="text-gold" />}
          />
          <SummaryRow
            label="Payment"
            value="Cash on Delivery / UPI"
            icon={<Wallet size={15} className="text-gold" />}
          />

          <div className="border-t border-white/5 pt-4 flex justify-between items-center">
            <span className="text-sm text-ink-secondary">Total Paid</span>
            <span className="text-xl font-bold text-white font-mono">
              {formatCurrency(order.total)}
            </span>
          </div>
        </motion.div>

        {/* WhatsApp & Continue Ordering CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-btn flex items-center justify-center gap-2 py-4 rounded-full bg-[#25D366] hover:bg-[#20BD5C] text-white font-bold transition-all duration-300 shadow-[0_10px_30px_rgba(37,211,102,0.35)] active:scale-95"
          >
            <MessageCircle size={20} /> Confirm via WhatsApp
          </a>
          <div className="flex gap-3">
            <Link
              href="/track"
              className="magnetic-btn flex-1 flex items-center justify-center py-3.5 rounded-full border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-all duration-300"
            >
              Order Tracking Page
            </Link>
            <Link
              href="/menu"
              className="magnetic-btn flex-1 flex items-center justify-center py-3.5 rounded-full border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-all duration-300"
            >
              Continue Ordering
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
