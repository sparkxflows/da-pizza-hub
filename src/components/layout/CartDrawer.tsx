"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  CircleCheck,
  Tag,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";
import { BRAND_CONFIG } from "@/lib/constants";
import { EXPO_EASE } from "@/components/motion/Reveal";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const total = useCartStore((s) => s.total());
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const couponError = useCartStore((s) => s.couponError);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const couponLoading = useCartStore((s) => s.couponLoading);

  const [couponInput, setCouponInput] = useState("");
  const belowMinOrder = subtotal > 0 && subtotal < BRAND_CONFIG.minOrder;

  function handleApplyCoupon() {
    if (couponInput.trim()) {
      applyCoupon(couponInput);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EXPO_EASE }}
            data-lenis-prevent
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-[#0E0E0E] border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,.6)] flex flex-col"
          >
            <div className="flex items-center justify-between px-7 py-6 border-b border-white/10">
              <div>
                <p className="uppercase tracking-[0.35em] text-[10px] text-gold mb-2">
                  DA PIZZA HUB
                </p>
                <h2 className="font-heading text-4xl text-white">Your Cart</h2>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close Cart"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 hover:bg-[#D91F26] transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
                <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#D91F26]/20 to-[#FF6B00]/20 border border-white/10">
                  <ShoppingBag size={42} className="text-gold" />
                </div>
                <h3 className="font-heading text-3xl text-white mb-4">
                  Your cart is empty
                </h3>
                <p className="text-white/60 leading-7 max-w-sm mb-8">
                  Fresh pizzas, burgers, pasta and more are waiting for you.
                  Start exploring our delicious menu.
                </p>
                <Link
                  href="/menu"
                  onClick={() => setTimeout(() => closeCart(), 0)}
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-8 font-semibold text-white transition-all hover:scale-105"
                >
                  Explore Menu
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.div
                        key={line.lineId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.3, ease: EXPO_EASE }}
                        className="flex gap-4 rounded-2xl bg-[#171717] p-3 border border-white/5"
                      >
                        {line.image && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0E0E0E]">
                            <Image
                              src={line.image}
                              alt={line.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white leading-tight">
                              {line.name}
                            </h4>
                            <button
                              onClick={() => removeLine(line.lineId)}
                              aria-label="Remove item"
                              className="text-white/40 hover:text-[#D91F26] transition-colors shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {line.customizationSummary && (
                            <p className="text-[11px] text-white/40 mt-0.5">
                              {line.customizationSummary}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center gap-2.5 bg-[#0E0E0E] rounded-full px-1.5 py-1">
                              <button
                                onClick={() =>
                                  updateQuantity(line.lineId, line.quantity - 1)
                                }
                                aria-label="Decrease quantity"
                                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <Minus size={12} className="text-white" />
                              </button>
                              <span className="text-xs font-semibold w-4 text-center text-white">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(line.lineId, line.quantity + 1)
                                }
                                aria-label="Increase quantity"
                                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <Plus size={12} className="text-white" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-[#FFC107]">
                              {formatCurrency(line.unitPrice * line.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/10 bg-[#101010] p-6 space-y-5">
                  {belowMinOrder && (
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                      <p className="text-sm leading-6 text-yellow-300">
                        Add{" "}
                        <span className="font-bold">
                          {formatCurrency(BRAND_CONFIG.minOrder - subtotal)}
                        </span>{" "}
                        more to reach the minimum order of{" "}
                        <span className="font-bold">
                          {formatCurrency(BRAND_CONFIG.minOrder)}
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <CircleCheck size={18} className="text-green-400" />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-300">
                            Coupon Applied Successfully
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-[#171717] p-2">
                      <div className="flex items-center gap-2">
                        <Tag size={18} className="ml-3 text-[#FFC107]" />
                        <input
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                          placeholder="Enter Coupon Code (e.g. FIRST30)"
                          className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="rounded-xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {couponLoading ? "Checking..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="mt-2 ml-3 text-xs text-red-400">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rounded-3xl bg-[#171717] p-5">
                    <div className="flex justify-between py-2">
                      <span className="text-white/60">Subtotal</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-green-400">Discount</span>
                        <span className="font-semibold text-green-400">
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}
                    <div className="my-4 h-px bg-white/10" />
                    <div className="flex justify-between">
                      <span className="text-xl font-bold text-white">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold text-[#FFC107]">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => closeCart()}
                    className={`flex h-16 w-full items-center justify-center rounded-2xl text-lg font-bold transition-all duration-300 ${
                      belowMinOrder
                        ? "pointer-events-none bg-white/10 text-white/40"
                        : "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(217,31,38,.35)]"
                    }`}
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
