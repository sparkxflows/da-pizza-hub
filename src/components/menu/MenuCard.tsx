"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Star, Settings2, Plus } from "lucide-react";
import type { MenuItem, PizzaMenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

export function MenuCard({
  item,
  onCustomize,
}: {
  item: MenuItem;
  onCustomize?: (item: PizzaMenuItem) => void;
}) {
  const addLine = useCartStore((s) => s.addLine);
  const displayPrice =
    item.type === "pizza"
      ? (item.prices?.regular ?? 0)
      : (item.price ?? 0);
  const imgSrc = item.image || "/images/pizza-generic/pizza-1.webp";

  function handleAction() {
    if (item.type === "pizza") {
      onCustomize?.(item);
      return;
    }
    addLine({
      itemId: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      quantity: 1,
      unitPrice: item.price,
    });
  }

  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-[28px] bg-[#151515] border border-white/5 hover:border-[#E53935]/40 shadow-2xl transition-all duration-500"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          sizes="(max-width:768px)100vw,25vw"
          className="object-cover group-hover:scale-110 duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {item.isBestSeller && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF9800] to-[#FFC107] px-3 py-1 text-[11px] font-bold uppercase text-black">
              <Flame size={12} />
              Bestseller
            </span>
          </div>
        )}

        {"isNew" in item && item.isNew && (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-[#D91F26] px-3 py-1 text-[11px] font-bold uppercase text-white">
              New
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-white">4.8</span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-xl font-bold text-white mb-1.5 sm:mb-2 line-clamp-1">
          {item.name}
        </h3>
        <p className="min-h-[48px] sm:min-h-[56px] text-xs sm:text-sm text-white/55 leading-5 sm:leading-6 line-clamp-2 mb-3 sm:mb-5">
          {item.description || "\u00a0"}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mb-1">
              {item.type === "pizza" ? "Starting From" : "Price"}
            </p>
            <h4 className="text-xl sm:text-3xl font-bold text-[#FFC107]">
              {formatCurrency(displayPrice)}
            </h4>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleAction}
            aria-label={
              item.type === "pizza"
                ? `Customize ${item.name}`
                : `Add ${item.name} to cart`
            }
            className="group/add relative h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] shadow-[0_10px_30px_rgba(217,31,38,.35)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(217,31,38,.55)] shrink-0"
          >
            {item.type === "pizza" ? (
              <>
                <Settings2
                  size={18}
                  className="mx-auto text-white transition-transform duration-300 group-hover/add:rotate-90 sm:hidden"
                />
                <Settings2
                  size={22}
                  className="mx-auto hidden text-white transition-transform duration-300 group-hover/add:rotate-90 sm:block"
                />
              </>
            ) : (
              <>
                <Plus
                  size={20}
                  className="mx-auto text-white transition-transform duration-300 group-hover/add:scale-125 sm:hidden"
                />
                <Plus
                  size={24}
                  className="mx-auto hidden text-white transition-transform duration-300 group-hover/add:scale-125 sm:block"
                />
              </>
            )}
          </motion.button>
        </div>

        <button
          onClick={handleAction}
          className="mt-4 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(217,31,38,.35)] active:scale-[0.98]"
        >
          {item.type === "pizza" ? (
            <>
              <Settings2 size={16} className="sm:hidden" />
              <Settings2 size={18} className="hidden sm:block" />
              Customize Pizza
            </>
          ) : (
            <>
              <Plus size={16} className="sm:hidden" />
              <Plus size={18} className="hidden sm:block" />
              Add To Cart
            </>
          )}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-[28px] border border-[#E53935]/30" />
        <div className="absolute -inset-px rounded-[28px] bg-gradient-to-r from-[#D91F26]/10 via-transparent to-[#FF6B00]/10 blur-xl" />
      </div>
    </motion.div>
  );
}
