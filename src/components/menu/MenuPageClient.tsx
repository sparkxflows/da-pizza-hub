"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border ${
        active
          ? "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white border-transparent shadow-[0_10px_30px_rgba(217,31,38,.35)] scale-105"
          : "bg-[#151515] border-white/10 text-white/60 hover:border-[#D91F26] hover:text-white hover:bg-[#1b1b1b]"
      }`}
    >
      {label}
    </button>
  );
}

export function MenuPageClient({ items }: { items: MenuItem[] }) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<"all" | MenuCategory>(
    "all"
  );
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
    const cat = searchParams.get("cat");
    if (cat === "pizza") {
      setActiveCategory("royal-special");
    } else if (cat && ALL_CATEGORY_TABS.some((t) => t.key === cat)) {
      setActiveCategory(cat as MenuCategory);
    }
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let list =
      activeCategory === "all"
        ? Object.values(grouped).flat()
        : (grouped[activeCategory] ?? []);

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
  }, [activeCategory, query, grouped]);

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[radial-gradient(circle_at_top,#1b1b1b_0%,#0b0b0b_45%,#050505_100%)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14"
        >
          <p className="uppercase tracking-[0.4em] text-gold text-xs mb-4">
            DA PIZZA HUB
          </p>
          <h1 className="font-heading text-5xl lg:text-7xl leading-none">
            Our Signature Menu
          </h1>
          <p className="text-white/60 text-lg leading-8 max-w-3xl mt-6">
            Freshly handcrafted pizzas, burgers, pasta, garlic bread, wraps,
            shakes and desserts made using premium ingredients. 100% Pure Veg.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mb-14"
        >
          <Search
            size={22}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gold"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pizza, burger, pasta..."
            className="w-full h-16 rounded-2xl bg-[#121212] border border-white/10 pl-16 pr-14 text-white placeholder:text-white/40 focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/30 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </motion.div>

        <div className="sticky top-20 z-40 mb-12 bg-[#090909]/90 backdrop-blur-xl border-y border-white/5">
          <div className="flex gap-3 overflow-x-auto py-5 scrollbar-none">
            <CategoryTabButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label="All"
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

        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <StaggerContainer
              key={activeCategory + query}
              staggerDelay={0.04}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={staggerItemVariants}
                  layout
                >
                  <MenuCard item={item} onCustomize={setCustomizing} />
                </motion.div>
              ))}
            </StaggerContainer>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center text-center"
            >
              <h3 className="font-heading text-4xl mb-4">No Items Found</h3>
              <p className="text-white/60 max-w-md leading-7 mb-8">
                No delicious items matched your search. Try another keyword or
                browse every category.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white font-semibold hover:scale-105 transition-all"
              >
                View Full Menu
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
