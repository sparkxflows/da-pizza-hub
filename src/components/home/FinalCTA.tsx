"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ArrowRight,
  Phone,
  Star,
  ExternalLink,
} from "lucide-react";
import type { Branch } from "@/lib/types";
import { EXPO_EASE } from "@/components/motion/Reveal";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EXPO_EASE },
  },
};

export function FinalCTA({ primaryBranch }: { primaryBranch: Branch }) {
  return (
    <section className="relative overflow-hidden py-32 lg:py-40">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#090909] via-[#111111] to-[#050505]" />

        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.35, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-48 top-10 h-[520px] w-[520px] rounded-full bg-[#D91F26] blur-[180px]"
        />
        <motion.div
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-44 bottom-0 h-[520px] w-[520px] rounded-full bg-[#F6C453] blur-[200px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.05),transparent_72%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="relative mx-auto max-w-7xl px-6"
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center rounded-full border border-[#F6C453]/20 bg-[#F6C453]/10 px-6 py-3 backdrop-blur-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F6C453]">
                Fresh • Hot • Pure Veg • Hansi
              </span>
            </div>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="mt-10 font-heading text-6xl leading-[0.9] text-white md:text-7xl xl:text-8xl"
          >
            Every Slice
            <br />
            Made To
            <span className="block bg-gradient-to-r from-[#F6C453] via-white to-[#F6C453] bg-clip-text text-transparent">
              Impress.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-10 max-w-3xl text-lg leading-9 text-white/65 lg:text-xl"
          >
            Experience handcrafted pizzas baked with premium mozzarella,
            garden-fresh vegetables, signature sauces and authentic flavours —
            prepared fresh for every single order right here in Gandhi Market, Hansi.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/menu"
              className="group inline-flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-10 text-lg font-bold text-white shadow-[0_20px_50px_rgba(217,31,38,.35)] transition-all duration-300 hover:scale-105"
            >
              <ShoppingBag size={22} />
              Order Online
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </Link>

            <a
              href={`tel:+91${primaryBranch.phone}`}
              className="group inline-flex h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-10 text-lg font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-[#F6C453]/40 hover:bg-white/10 hover:scale-105"
            >
              <Phone size={20} />
              Call Store: {primaryBranch.phone}
            </a>
          </motion.div>

          {/* Real Google Rating & Hansi Community Scorecard */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {[
              {
                value: "4.3★",
                label: "Google Rating",
                subtext: "1,244+ Verified Reviews",
                badge: "Hansi #1 Rated",
              },
              {
                value: "9,500+",
                label: "Orders Delivered",
                subtext: "Across Hansi City",
                badge: "Loved Locally",
              },
              {
                value: "100%",
                label: "Pure Vegetarian",
                subtext: "Zero Non-Veg Cross Contact",
                badge: "Guaranteed Pure",
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F6C453]/15 text-[#F6C453] border border-[#F6C453]/25 inline-block mb-3">
                    {stat.badge}
                  </span>
                  <h3 className="font-heading text-5xl text-[#F6C453]">
                    {stat.value}
                  </h3>
                  <p className="mt-2 text-white font-semibold text-base">{stat.label}</p>
                  <p className="mt-1 text-xs text-white/50">{stat.subtext}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-16 flex justify-center"
          >
            <a
              href="https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-[#F6C453]/20 bg-[#F6C453]/10 px-8 py-4 backdrop-blur-xl hover:bg-[#F6C453]/20 transition-all duration-300 group"
            >
              <div className="flex text-[#F6C453]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={15} className="fill-[#F6C453]" />
                ))}
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                Rated 4.3★ on Google by 1,200+ Hansi food lovers
              </span>
              <ExternalLink size={14} className="text-[#F6C453] opacity-75 group-hover:opacity-100" />
            </a>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#D91F26]/10 to-transparent pointer-events-none" />
    </section>
  );
}
