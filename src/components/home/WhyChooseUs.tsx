"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  Award,
  ChefHat,
  Zap,
  Store,
  ArrowRight,
} from "lucide-react";

const PILLARS = [
  {
    icon: Leaf,
    title: "Premium Ingredients",
    desc: "Fresh vegetables and premium cheese sourced daily for every pizza.",
  },
  {
    icon: Award,
    title: "100% Pure Veg",
    desc: "Every recipe is completely vegetarian across all branches.",
  },
  {
    icon: ChefHat,
    title: "Fresh Dough",
    desc: "Hand stretched every day for the perfect crust and texture.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "Delivered hot and fresh to your doorstep in the shortest time.",
  },
  {
    icon: Store,
    title: "Hansi Store",
    desc: "Freshly hand-stretched dough and 100% real mozzarella cheese in Hansi.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-[#F6C453]">
            WHY CHOOSE US
          </span>
          <h2 className="mt-5 font-heading text-5xl lg:text-6xl">
            More Than Just Pizza
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Fresh ingredients, handcrafted recipes and exceptional service —
            everything designed to give you the best pizza experience.
          </p>
        </div>

        <div className="grid items-stretch gap-8 md:grid-cols-2 xl:grid-cols-5">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 * idx }}
                whileHover={{ y: -10 }}
                className="group relative flex min-h-[420px] xl:min-h-[520px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#171717] p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B00]/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                <div className="relative flex h-full flex-col">
                  <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D91F26] to-[#FF6B00] shadow-[0_12px_30px_rgba(217,31,38,.35)]">
                    <Icon size={28} className="text-white" />
                  </div>

                  <h3 className="text-2xl font-semibold">{pillar.title}</h3>
                  <p className="mt-4 flex-1 leading-7 text-white/60">
                    {pillar.desc}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-8">
                    <span className="text-sm font-medium text-[#F6C453]">
                      Learn More
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] transition duration-300 group-hover:translate-x-1">
                      <ArrowRight size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
