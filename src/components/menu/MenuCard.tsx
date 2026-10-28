"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Settings2, Plus } from "lucide-react";
import type { MenuItem, PizzaMenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";

const CATEGORY_NAMES: Record<string, string> = {
  "royal-special": "Royal Special",
  "veg-special": "Veg Special",
  "veg-feast": "Veg Feast",
  "veg-delight": "Veg Delight",
  "veg-treat": "Veg Treat",
  "simply-veg": "Simply Veg",
  burger: "Burger",
  fries: "Fries",
  pasta: "Pasta",
  wrap: "Wrap",
  bread: "Garlic Bread",
  "sides-other": "Sides",
  shake: "Shake",
  mocktail: "Mocktail",
  "double-pizza": "Double Pizza",
  combo: "Combo",
  dessert: "Dessert",
};

export function MenuCard({
  item,
  onCustomize,
}: {
  item: MenuItem;
  onCustomize?: (item: PizzaMenuItem) => void;
}) {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);
  const displayPrice =
    item.type === "pizza"
      ? (item.prices?.regular ?? 0)
      : (item.price ?? 0);
  const imgSrc = item.image || "/images/pizza-generic/pizza-1.webp";
  const catLabel = CATEGORY_NAMES[item.category] || item.category;

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
    openCart();
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] bg-[#131313] border border-white/10 hover:border-[#F6C453]/40 shadow-lg transition-all duration-300"
    >
      {/* Photo with Category & Bestseller Badges at top */}
      <div className="relative aspect-[16/11] overflow-hidden bg-black/40">
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          sizes="(max-width:768px) 100vw, 25vw"
          className="object-cover group-hover:scale-106 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Top Category Badge + Bestseller Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white/90 border border-white/15 shadow-sm">
            {catLabel}
          </span>

          {item.isBestSeller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF9800] to-[#FFC107] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black shadow-md">
              <Flame size={10} />
              Bestseller
            </span>
          )}
        </div>
      </div>

      {/* Card Content: Title on left, Price on right side of title */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#F6C453] transition-colors">
              {item.name}
            </h3>
            <span className="text-xs sm:text-sm font-bold text-[#FFC107] font-mono shrink-0">
              {item.type === "pizza"
                ? `Starts ${formatCurrency(displayPrice)}`
                : formatCurrency(displayPrice)}
            </span>
          </div>

          <p className="text-xs text-white/50 leading-relaxed line-clamp-1 mb-3">
            {item.description || "Freshly baked on order"}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          aria-label={
            item.type === "pizza"
              ? `Customize ${item.name}`
              : `Add ${item.name} to cart`
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D91F26] to-[#b3141a] hover:from-[#e52830] hover:to-[#c41920] py-2.5 text-xs font-bold text-white transition-all duration-200 active:scale-[0.98] shadow-md"
        >
          {item.type === "pizza" ? (
            <>
              <Settings2 size={14} />
              <span>Customize Pizza</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Add To Cart</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
