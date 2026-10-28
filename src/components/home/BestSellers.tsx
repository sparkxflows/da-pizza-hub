"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MenuItem, PizzaMenuItem } from "@/lib/types";
import {
  Reveal,
  StaggerContainer,
  staggerItemVariants,
} from "@/components/motion/Reveal";
import { MenuCard } from "@/components/menu/MenuCard";
import { PizzaCustomizerModal } from "@/components/menu/PizzaCustomizerModal";

export function BestSellers({ items }: { items: MenuItem[] }) {
  const [customizing, setCustomizing] = useState<PizzaMenuItem | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
                Fan Favourites
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">
                Best Sellers
              </h2>
            </div>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {items.slice(0, 5).map((item) => (
            <motion.div key={item.id} variants={staggerItemVariants}>
              <MenuCard item={item} onCustomize={setCustomizing} />
            </motion.div>
          ))}
        </StaggerContainer>
      </div>

      <PizzaCustomizerModal
        item={customizing}
        onClose={() => setCustomizing(null)}
      />
    </section>
  );
}
