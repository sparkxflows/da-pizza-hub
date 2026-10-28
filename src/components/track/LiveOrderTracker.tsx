"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  CheckCircle2,
  Flame,
  Bike,
  PartyPopper,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  Phone,
  Sparkles,
} from "lucide-react";
import type { Branch } from "@/lib/types";

export type OrderStageKey =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out-for-delivery"
  | "delivered";

export interface LiveOrderDetails {
  orderId: string;
  name: string;
  phone: string;
  address?: string;
  branch?: Branch;
  placedAt: number;
  total: number;
  status?: string; // from DB: 'new' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled'
  orderType?: "delivery" | "pickup";
  customerLat?: number | null;
  customerLng?: number | null;
}

const STAGES: {
  key: OrderStageKey;
  label: string;
  tagline: string;
  atMinute: number;
  icon: typeof ClipboardCheck;
}[] = [
  {
    key: "placed",
    label: "Order Placed",
    tagline: "Order received by Da Pizza Hub",
    atMinute: 0,
    icon: ClipboardCheck,
  },
  {
    key: "confirmed",
    label: "Accepted",
    tagline: "Kitchen confirmed your order",
    atMinute: 2,
    icon: CheckCircle2,
  },
  {
    key: "preparing",
    label: "Baking Fresh",
    tagline: "In the 300°C stone oven",
    atMinute: 6,
    icon: Flame,
  },
  {
    key: "out-for-delivery",
    label: "On The Way",
    tagline: "Rider dispatched with hot bag",
    atMinute: 20,
    icon: Bike,
  },
  {
    key: "delivered",
    label: "Delivered",
    tagline: "Enjoy your 100% Pure Veg meal!",
    atMinute: 35,
    icon: PartyPopper,
  },
];

// Simple gentle audio chime using Web Audio API
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // audio not allowed before interaction
  }
}

export function LiveOrderTracker({
  order,
  onStatusUpdate,
}: {
  order: LiveOrderDetails;
  onStatusUpdate?: (status: string) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState<string | null>(
    order.status ?? null
  );

  // Poll backend for real status every 5 seconds
  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      if (!order.orderId) return;
      try {
        const res = await fetch(
          `/api/orders?orderNumber=${encodeURIComponent(order.orderId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.order?.status && mounted) {
            setRemoteStatus(data.order.status);
            onStatusUpdate?.(data.order.status);
          }
        }
      } catch {
        // silent fail on network glitch
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [order.orderId, onStatusUpdate]);

  // Tick clock every second for live countdown
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Compute active stage based on DB status OR time elapsed
  const elapsedSeconds = Math.max(0, Math.floor((now - order.placedAt) / 1000));
  const elapsedMinutes = elapsedSeconds / 60;

  const activeIdx = useMemo(() => {
    if (remoteStatus) {
      if (remoteStatus === "completed") return 4;
      if (remoteStatus === "out_for_delivery") return 3;
      if (remoteStatus === "preparing") return 2;
      if (remoteStatus === "new") {
        return elapsedMinutes >= 2 ? 1 : 0;
      }
    }
    // Fallback: time-based simulation
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) {
      if (elapsedMinutes >= STAGES[i].atMinute) idx = i;
    }
    return idx;
  }, [remoteStatus, elapsedMinutes]);

  const currentStage = STAGES[activeIdx];
  const isDelivered = activeIdx === 4;

  // Sound chime when stage advances
  const [prevStageIdx, setPrevStageIdx] = useState(activeIdx);
  useEffect(() => {
    if (activeIdx > prevStageIdx) {
      setPrevStageIdx(activeIdx);
      if (soundEnabled) playChime();
    }
  }, [activeIdx, prevStageIdx, soundEnabled]);

  // Estimated delivery remaining seconds (target: 35 mins from placedAt)
  const totalTargetSeconds = 35 * 60;
  const remainingSeconds = isDelivered
    ? 0
    : Math.max(0, totalTargetSeconds - elapsedSeconds);
  const remainingMin = Math.floor(remainingSeconds / 60);
  const remainingSec = remainingSeconds % 60;

  // Format placed time
  const placedDate = new Date(order.placedAt);
  const formatTimeStr = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const branchName = order.branch?.name ?? "Da Pizza Hub – Hansi";
  const branchAddress =
    order.branch?.address ??
    "Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana 125033";
  const mapsUrl =
    order.branch?.mapsUrl ?? "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6";
  const branchPhone = order.branch?.phone ?? "9911273199";

  return (
    <div className="w-full space-y-4">
      {/* 1. TOP LIVE STATUS HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-left">
        {/* Glowing background ambient gradient */}
        <div
          aria-hidden="true"
          className={`absolute -top-20 -right-20 h-56 w-56 rounded-full blur-[80px] pointer-events-none transition-colors duration-700 ${
            isDelivered
              ? "bg-[#25D366]/20"
              : activeIdx >= 2
              ? "bg-[#FF6B00]/25"
              : "bg-[#F6C453]/20"
          }`}
        />

        {/* Live Header row */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDelivered ? "bg-[#25D366]" : "bg-[#D91F26]"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isDelivered ? "bg-[#25D366]" : "bg-[#D91F26]"
                }`}
              />
            </span>
            <span
              className={`text-xs font-black tracking-widest uppercase ${
                isDelivered ? "text-[#25D366]" : "text-[#D91F26]"
              }`}
            >
              {isDelivered ? "Order Delivered" : "Live Kitchen Tracking"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute chimes" : "Enable chimes"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white transition"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] font-bold text-white/80">
              #{order.orderId}
            </span>
          </div>
        </div>

        {/* Big Live Countdown Banner */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">
              {isDelivered ? "Status" : "Estimated Arrival"}
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              {isDelivered ? (
                <span className="text-3xl sm:text-4xl font-extrabold text-[#25D366] font-heading flex items-center gap-2">
                  <Sparkles size={28} className="text-[#F6C453]" /> Delivered Hot & Fresh!
                </span>
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                    {String(remainingMin).padStart(2, "0")}:
                    {String(remainingSec).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-[#F6C453]">
                    mins remaining
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-white/70">
              {currentStage.tagline}
            </p>
          </div>

          {/* Micro Animation Box */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            {activeIdx === 0 && (
              <div className="flex items-center gap-2.5 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full bg-[#F6C453] animate-pulse" />
                <span>Waiting for branch review</span>
              </div>
            )}
            {activeIdx === 1 && (
              <div className="flex items-center gap-2.5 text-xs text-[#F6C453]">
                <CheckCircle2 size={16} className="animate-bounce" />
                <span>Accepted by Hansi kitchen</span>
              </div>
            )}
            {activeIdx === 2 && (
              <div className="flex items-center gap-2.5 text-xs text-[#FF6B00]">
                <Flame size={18} className="animate-pulse text-[#FF6B00]" />
                <span className="font-semibold">Oven baking at 300°C</span>
              </div>
            )}
            {activeIdx === 3 && (
              <div className="flex items-center gap-2.5 text-xs text-[#F6C453]">
                <Bike size={18} className="animate-pulse" />
                <span className="font-semibold">Rider on the road</span>
              </div>
            )}
            {activeIdx === 4 && (
              <div className="flex items-center gap-2.5 text-xs text-[#25D366]">
                <PartyPopper size={18} />
                <span className="font-bold">Enjoy your meal!</span>
              </div>
            )}
          </div>
        </div>

        {/* 5-STAGE PROGRESS STEPPER */}
        <div className="relative z-10 mt-8">
          <div className="relative flex justify-between">
            {/* Background track line */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />
            {/* Active filled line */}
            <motion.div
              className="absolute top-4 left-4 h-1 bg-gradient-to-r from-[#F6C453] via-[#FF6B00] to-[#25D366] -translate-y-1/2 z-0 rounded-full shadow-[0_0_12px_rgba(246,196,83,0.6)]"
              initial={{ width: "0%" }}
              animate={{
                width: `${(activeIdx / (STAGES.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {STAGES.map((s, idx) => {
              const isPast = idx < activeIdx;
              const isCurrent = idx === activeIdx;
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <motion.div
                    animate={
                      isCurrent && !isDelivered
                        ? { scale: [1, 1.15, 1] }
                        : { scale: 1 }
                    }
                    transition={{
                      duration: 1.8,
                      repeat: isCurrent && !isDelivered ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all duration-500 shadow-md ${
                      isPast
                        ? "border-[#25D366] bg-[#25D366] text-black"
                        : isCurrent
                        ? "border-[#F6C453] bg-gradient-to-br from-[#F6C453] to-[#FF6B00] text-black ring-4 ring-[#F6C453]/25"
                        : "border-white/20 bg-black/60 text-white/40"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.4} />
                  </motion.div>
                  <p
                    className={`mt-2 text-[10px] sm:text-xs font-bold transition-colors ${
                      isCurrent
                        ? "text-[#F6C453]"
                        : isPast
                        ? "text-white"
                        : "text-white/40"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Status Detail Card */}
        <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                {currentStage.label}
              </p>
              <p className="mt-0.5 text-xs text-white/65">
                {currentStage.tagline}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/80">
              Stage {activeIdx + 1} of 5
            </span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE LIVE RADAR MINI-MAP */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 backdrop-blur-2xl text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#D91F26]" />
            <h3 className="text-sm font-bold text-white">
              Live Delivery Route
            </h3>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-[#F6C453] hover:underline"
          >
            Open in Google Maps <ExternalLink size={12} />
          </a>
        </div>

        {/* Animated Visual Route Canvas / SVG */}
        <div className="relative h-44 w-full rounded-2xl border border-white/10 bg-gradient-to-b from-black/80 to-[#121212] overflow-hidden p-4 flex flex-col justify-between">
          {/* Subtle grid pattern for radar effect */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Animated radar concentric pulse from store */}
          <div className="absolute top-8 left-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="h-16 w-16 rounded-full border border-[#D91F26]/40 animate-ping" />
          </div>

          {/* Store Pin (Hansi) */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D91F26] text-white shadow-[0_0_20px_rgba(217,31,38,0.6)]">
              <span className="font-heading font-black text-sm">DPH</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{branchName}</p>
              <p className="text-[11px] text-white/60 line-clamp-1">
                {branchAddress}
              </p>
            </div>
          </div>

          {/* Glowing Animated Connecting Dash Route */}
          <div className="relative my-2 flex items-center justify-between px-5">
            <div className="h-0.5 w-full bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D91F26] via-[#FF6B00] to-[#25D366]"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ width: "40%" }}
              />
            </div>
            {/* Bike icon moving along route */}
            <motion.div
              className="absolute left-1/2 -top-3.5 -translate-x-1/2 rounded-full bg-[#FF6B00] p-1.5 text-white shadow-[0_0_15px_rgba(255,107,0,0.8)]"
              animate={
                activeIdx >= 3 && !isDelivered
                  ? { x: [-30, 30] }
                  : { x: 0 }
              }
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <Bike size={14} />
            </motion.div>
          </div>

          {/* Customer Destination Pin */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25D366] text-black font-bold shadow-[0_0_20px_rgba(37,211,102,0.5)]">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {order.name || "Customer"} (Delivery Address)
              </p>
              <p className="text-[11px] text-white/60 line-clamp-1">
                {order.address || "Hansi, Haryana"}
              </p>
            </div>
          </div>
        </div>

        {/* Store call info */}
        <div className="mt-3 flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
          <span>Need help with delivery?</span>
          <a
            href={`tel:+91${branchPhone}`}
            className="flex items-center gap-1 font-semibold text-[#F6C453] hover:underline"
          >
            <Phone size={12} /> Call Store: +91 {branchPhone}
          </a>
        </div>
      </div>

      {/* 3. LIVE KITCHEN ACTIVITY FEED (EXPANDABLE) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-left overflow-hidden">
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex w-full items-center justify-between p-5 text-sm font-semibold text-white/90 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Clock size={16} className="text-[#F6C453]" />
            Kitchen Activity Feed
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              showLog ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 p-5 space-y-3.5 text-xs"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-white/40">
                  {formatTimeStr(placedDate)}
                </span>
                <span className="text-white/80">
                  ✅ Order <span className="font-mono">#{order.orderId}</span> placed by {order.name || "customer"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-white/40">
                  {formatTimeStr(new Date(order.placedAt + 2 * 60000))}
                </span>
                <span className={activeIdx >= 1 ? "text-white/80" : "text-white/30"}>
                  👨‍🍳 Order accepted by Da Pizza Hub Hansi Kitchen
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-white/40">
                  {formatTimeStr(new Date(order.placedAt + 6 * 60000))}
                </span>
                <span className={activeIdx >= 2 ? "text-white/80" : "text-white/30"}>
                  🍕 Hand-stretched dough topped & placed in stone oven
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-white/40">
                  {formatTimeStr(new Date(order.placedAt + 20 * 60000))}
                </span>
                <span className={activeIdx >= 3 ? "text-white/80" : "text-white/30"}>
                  🛵 Quality checked, boxed in insulated bag & rider dispatched
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-white/40">
                  {formatTimeStr(new Date(order.placedAt + 35 * 60000))}
                </span>
                <span className={activeIdx >= 4 ? "text-[#25D366] font-bold" : "text-white/30"}>
                  🎉 Delivered hot & delicious to your doorstep!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
