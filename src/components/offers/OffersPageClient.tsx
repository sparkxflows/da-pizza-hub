"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  ArrowRight,
  Clock,
  Sparkles,
  Percent,
  Bike,
  Flame,
  Plus,
} from "lucide-react";
import type { Coupon, MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

const FEATURED_DEALS = [
  {
    title: "30% OFF",
    subtitle: "On Your First Order",
    description:
      "Get flat 30% OFF on your first online order of freshly handcrafted pizzas across Hansi.",
    image: "/images/offers/offer-1.webp",
    badge: "LIMITED TIME OFFER",
    code: "FIRST30",
    gradient: "from-red-700/90 via-red-900/70 to-black/90",
  },
  {
    title: "FREE DELIVERY",
    subtitle: "Within 3 KM in Hansi",
    description:
      "Hot, fresh and fast delivery right to your doorstep — 100% free within 3 km from our Gandhi Market store.",
    image: "/images/offers/offer-2.webp",
    badge: "LIMITED TIME DEAL",
    code: null,
    gradient: "from-emerald-700/95 via-green-950/80 to-black/95",
  },
  {
    title: "FAMILY COMBO",
    subtitle: "Starting @ ₹499",
    description:
      "2 Pizzas + Stuffed Garlic Bread + Cold Drink. Perfect for weekend family nights.",
    image: "/images/offers/offer-3.webp",
    badge: "LIMITED TIME SPECIAL",
    code: "FAMILY100",
    gradient: "from-orange-700/90 via-red-800/70 to-black/90",
  },
];

const COMBO_TAGS: Record<string, string> = {
  "veg-single-combo": "Student Deal",
  "veg-double-combo": "Couple Special",
  "veg-treat-combo-4": "Family Favourite",
  "veg-delight-combo-4": "Best Value",
  "veg-feast-combo-4": "Party Combo",
  "veg-special-combo-4": "Mega Feast",
};

export function OffersPageClient({
  coupons,
  combos,
}: {
  coupons: Coupon[];
  combos: MenuItem[];
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);

  const activeCoupons = coupons.filter((c) => c.isActive !== false);

  function handleCopy(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  }

  function handleOrderCombo(combo: MenuItem) {
    const price = combo.type === "simple" ? combo.price : 0;
    addLine({
      itemId: combo.id,
      name: combo.name,
      image: combo.image,
      basePrice: price,
      quantity: 1,
      unitPrice: price,
    });
    openCart();
  }

  return (
    <div className="min-h-screen pt-36 sm:pt-40 lg:pt-44 pb-28 bg-[#090909]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F6C453]/30 bg-[#F6C453]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#F6C453] mb-3">
            <Percent size={13} />
            <span>SPECIAL DISCOUNTS &amp; DEALS</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl leading-tight text-white">
            Offers &amp; Exclusive Deals
          </h1>
          <p className="text-white/60 text-xs sm:text-base leading-relaxed max-w-2xl mt-2">
            Save maximum on your favorite handcrafted gourmet pizzas, burgers &amp; combos in Hansi. Apply coupon code at checkout!
          </p>
        </motion.div>

        {/* Section 1: Featured Limited-Time Deals (The 3 Hero Cards) */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#FF9800] font-semibold block mb-1">
                TODAY&apos;S BEST DEALS
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading text-white font-bold">
                Limited Time Deals
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F6C453] hover:text-white transition-colors"
            >
              <span>Explore All Categories</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {FEATURED_DEALS.map((offer, idx) => (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * idx }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl transition-all duration-300 min-h-[400px] flex flex-col justify-between hover:border-white/20"
              >
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${offer.gradient}`}
                />
                <div className="absolute inset-0 bg-black/25" />

                <div className="relative z-10 flex h-full flex-col justify-between p-7">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F6C453] backdrop-blur-md">
                        <Clock size={11} className="text-[#F6C453]" />
                        {offer.badge}
                      </span>
                    </div>

                    <h3 className="font-heading text-4xl leading-none mt-4 text-white">
                      {offer.title}
                    </h3>
                    <p className="text-lg mt-2 font-medium text-[#F6C453]">
                      {offer.subtitle}
                    </p>
                    <p className="text-white/80 mt-2 leading-relaxed text-xs max-w-xs">
                      {offer.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-3">
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-2.5 text-xs font-bold transition-all hover:bg-[#F6C453] hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <span>Order on Menu</span>
                      <ArrowRight size={14} />
                    </Link>

                    {offer.code && (
                      <button
                        type="button"
                        onClick={() => handleCopy(offer.code!)}
                        className="flex items-center gap-1 rounded-xl bg-black/60 backdrop-blur-md px-3 py-2 text-xs font-mono font-bold text-[#FFC107] border border-white/15"
                      >
                        <span>{offer.code}</span>
                        {copiedCode === offer.code ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} className="text-white/60" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 2: All Active Discount Codes from Supabase */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#FF9800] font-semibold block mb-1">
                DISCOUNT CODES
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading text-white font-bold">
                Active Promo Coupons
              </h2>
            </div>
            <p className="text-xs text-white/50">
              Tap any code to copy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeCoupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              const isPercent = coupon.type === "percent";

              return (
                <motion.div
                  key={coupon.code}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131313] p-5 shadow-lg hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-full bg-[#D91F26]/20 border border-[#D91F26]/40 px-3 py-1 text-xs font-bold text-[#FF6B00]">
                        {isPercent ? `${coupon.value}% OFF` : `Flat ₹${coupon.value} OFF`}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {coupon.description}
                    </h3>

                    <div className="mt-2.5 space-y-0.5 text-xs text-white/45">
                      {coupon.minOrder > 0 ? (
                        <p>
                          Min Order:{" "}
                          <span className="text-white/80 font-medium">
                            {formatCurrency(coupon.minOrder)}
                          </span>
                        </p>
                      ) : (
                        <p>No minimum order required</p>
                      )}
                      {coupon.maxDiscount ? (
                        <p>
                          Max Savings:{" "}
                          <span className="text-white/80 font-medium">
                            {formatCurrency(coupon.maxDiscount)}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/25 bg-black/40 px-3 py-1.5 text-xs font-mono font-bold text-[#FFC107] hover:border-[#FFC107] transition"
                    >
                      <span>{coupon.code}</span>
                      {isCopied ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} className="text-white/60" />
                      )}
                    </button>

                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition"
                    >
                      <span>Apply &amp; Order</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Combo Deals */}
        {combos.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-[#FF9800] font-semibold block mb-1">
                  MEAL COMBOS
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading text-white font-bold">
                  Value Combo Deals
                </h2>
              </div>
              <Link
                href="/menu?cat=combo"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F6C453] hover:text-white transition-colors"
              >
                <span>View All Combos</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.slice(0, 6).map((combo) => {
                const price = combo.type === "simple" ? combo.price : 0;
                const tag = COMBO_TAGS[combo.id] ?? "Value Combo";

                return (
                  <div
                    key={combo.id}
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131313] p-4 shadow-lg hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black/40 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={combo.image || "/images/combos/combo-1.webp"}
                          alt={combo.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="rounded-full bg-[#FF9800] px-2.5 py-0.5 text-[10px] font-bold text-black shadow-md">
                            {tag}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {combo.name}
                        </h3>
                        <span className="font-mono text-sm sm:text-base font-bold text-[#FFC107] shrink-0">
                          {formatCurrency(price)}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 line-clamp-2">
                        {combo.description || "Fresh pizzas + sides combo"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOrderCombo(combo)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D91F26] to-[#b3141a] py-2.5 text-xs font-bold text-white shadow-md hover:from-[#e52830] hover:to-[#c41920] transition active:scale-95"
                    >
                      <Plus size={14} />
                      <span>Order Combo</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Explore All Categories CTA Strip */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Looking for our Full Signature Menu?
            </h3>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Explore 58+ freshly baked pure-veg pizzas, burgers, pasta, garlic breads &amp; shakes.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Explore All Categories</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
