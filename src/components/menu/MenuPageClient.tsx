"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Flame } from "lucide-react";
import type { MenuCategory, MenuItem, PizzaMenuItem } from "@/lib/types";
import { ALL_CATEGORY_TABS } from "@/lib/constants";
import { MenuCard } from "@/components/menu/MenuCard";
import { PizzaCustomizerModal } from "@/components/menu/PizzaCustomizerModal";
import {
  StaggerContainer,
  staggerItemVariants,
} from "@/components/motion/Reveal";

function CategoryTabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
        active
          ? "bg-[#D91F26] text-white border-[#D91F26] shadow-md scale-105"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function MenuPageClient({ items }: { items: MenuItem[] }) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<
    "all" | "bestsellers" | MenuCategory
  >("all");
  const [query, setQuery] = useState("");
  const [customizing, setCustomizing] = useState<PizzaMenuItem | null>(null);

  const grouped = useMemo(() => {
    const map: Partial<Record<MenuCategory, MenuItem[]>> = {};
    for (const item of items) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category]!.push(item);
    }
    return map;
  }, [items]);

  useEffect(() => {
    const filter = searchParams.get("filter");
    const cat = searchParams.get("cat");
    if (filter === "bestsellers" || cat === "bestsellers") {
      setActiveCategory("bestsellers");
    } else if (cat === "pizza") {
      setActiveCategory("royal-special");
    } else if (cat && ALL_CATEGORY_TABS.some((t) => t.key === cat)) {
      setActiveCategory(cat as MenuCategory);
    }
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let list: MenuItem[] = [];

    if (activeCategory === "bestsellers") {
      list = items.filter((item) => item.isBestSeller);
    } else if (activeCategory === "all") {
      list = Object.values(grouped).flat();
    } else {
      list = grouped[activeCategory] ?? [];
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          ("description" in item &&
            item.description?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, query, grouped, items]);

  return (
    <div className="min-h-screen pt-44 sm:pt-48 lg:pt-52 pb-24 bg-[#090909]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:text-left"
        >
          <p className="uppercase tracking-[0.35em] text-[#F6C453] text-xs font-semibold mb-2">
            DA PIZZA HUB
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl leading-tight text-white">
            {activeCategory === "bestsellers"
              ? "All Best Sellers"
              : "Our Signature Menu"}
          </h1>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-2xl mt-2">
            {activeCategory === "bestsellers"
              ? "The highest-rated, most-ordered customer favourites across all categories."
              : "Freshly handcrafted pizzas, burgers, pasta, garlic bread, and wraps. 100% Pure Veg."}
          </p>
        </motion.div>

        {/* Sleek Integrated Search Bar */}
        <div className="relative max-w-md mb-8">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pizza, burger, pasta..."
            className="w-full h-11 rounded-full bg-white/5 border border-white/10 pl-11 pr-10 text-xs sm:text-sm text-white placeholder:text-white/35 focus:border-[#D91F26] focus:bg-white/[0.08] outline-none transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Full-width Category Pills — NON-STICKY, Natural Wrapping, No Cut Borders */}
        <div className="mb-10 pb-6 border-b border-white/10">
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <CategoryTabButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label="All"
            />
            {/* Dedicated Best Sellers Pill */}
            <CategoryTabButton
              active={activeCategory === "bestsellers"}
              onClick={() => setActiveCategory("bestsellers")}
              label="Best Sellers"
              icon={<Flame size={13} className="text-[#FF9800]" />}
            />
            {ALL_CATEGORY_TABS.map((tab) => (
              <CategoryTabButton
                key={tab.key}
                active={activeCategory === tab.key}
                onClick={() => setActiveCategory(tab.key)}
                label={tab.label}
              />
            ))}
          </div>
        </div>

        {/* Items Grid with Compact Menu Cards */}
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <StaggerContainer
              key={activeCategory + query}
              staggerDelay={0.03}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
            >
              {filteredItems.map((item) => (
                <motion.div key={item.id} variants={staggerItemVariants} layout>
                  <MenuCard item={item} onCustomize={setCustomizing} />
                </motion.div>
              ))}
            </StaggerContainer>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 flex flex-col items-center text-center"
            >
              <h3 className="font-heading text-3xl sm:text-4xl text-white mb-2">
                No Dishes Found
              </h3>
              <p className="text-white/50 text-sm max-w-md leading-relaxed mb-6">
                No dishes matched your search. Try another keyword or browse all categories.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D91F26] to-[#b3141a] text-white text-xs font-bold hover:scale-105 transition-all shadow-lg"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PizzaCustomizerModal
        item={customizing}
        onClose={() => setCustomizing(null)}
      />
    </div>
  );
}
