"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  Award,
  ChefHat,
  Zap,
} from "lucide-react";

const PILLARS = [
  {
    icon: Leaf,
    title: "100% Pure Veg",
    desc: "Dedicated vegetarian kitchen adhering to strict purity and hygiene standards.",
  },
  {
    icon: ChefHat,
    title: "Fresh Handcrafted Dough",
    desc: "Kneaded and stretched fresh every morning for a light, crisp, and airy crust.",
  },
  {
    icon: Award,
    title: "Real Mozzarella Cheese",
    desc: "Rich, authentic dairy cheese giving you the signature gooey cheese pull every time.",
  },
  {
    icon: Zap,
    title: "Fast Doorstep Delivery",
    desc: "Dispatched hot in thermal insulated bags across Hansi in 30–40 minutes.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-24 lg:py-32">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D91F26]/5 blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-5xl lg:text-6xl text-white">
            More Than Just Pizza
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-white/60">
            Fresh ingredients, authentic hand-stretched dough and unmatched flavor —
            crafted with passion for Hansi&apos;s food lovers.
          </p>
        </div>

        {/* Dynamic interactive 4-card grid (snappy, instant response on hover in & hover back) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  opacity: { duration: 0.4, delay: 0.05 * idx },
                  y: { duration: 0.4, delay: 0.05 * idx },
                }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
                className="group relative flex flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#161616] p-7 hover:border-[#F6C453]/60 hover:bg-[#1c1c1c] hover:shadow-[0_20px_45px_rgba(246,196,83,0.14)] cursor-pointer"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D91F26] to-[#FF6B00] shadow-[0_10px_25px_rgba(217,31,38,.35)] group-hover:scale-110 transition-transform duration-200">
                  <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#F6C453] transition-colors duration-200">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60 group-hover:text-white/85 transition-colors duration-200">
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
