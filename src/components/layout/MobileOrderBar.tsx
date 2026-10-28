"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";

export function MobileOrderBar() {
  const lines = useCartStore((s) => s.lines);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !lines.length) return null;

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return (
    <motion.div
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed bottom-4 left-4 right-4 z-[50] lg:hidden"
    >
      <Link href="/checkout" className="block">
        <div className="rounded-2xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D91F26] to-[#FF6B00]">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                  YOUR ORDER
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {itemCount} Item{itemCount > 1 ? "s" : ""}
                </h3>
                <p className="mt-1 text-base font-semibold text-[#F6C453]">
                  {formatCurrency(subtotal)}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-3">
              <span className="text-sm font-bold text-white">Order Now →</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
