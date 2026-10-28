"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Phone } from "lucide-react";
import type { Branch } from "@/lib/types";

export function ContactCTA({ primaryBranch }: { primaryBranch: Branch }) {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#090909] via-[#121212] to-[#050505]" />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -left-44 top-0 h-[520px] w-[520px] rounded-full bg-[#D91F26] blur-[180px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -right-44 bottom-0 h-[520px] w-[520px] rounded-full bg-[#F6C453] blur-[190px]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-5xl text-center"
        >
          <div className="inline-flex items-center rounded-full border border-[#F6C453]/20 bg-[#F6C453]/10 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F6C453]">
              READY TO ORDER?
            </span>
          </div>

          <h2 className="mt-10 font-heading text-6xl leading-[0.9] text-white lg:text-8xl">
            Fresh Pizza.
            <br />
            Hot Delivery.
            <br />
            <span className="text-[#F6C453]">Every Time.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-white/65">
            From handcrafted pizzas to delicious burgers, wraps, pasta, garlic
            bread and refreshing shakes — your next favourite meal is just one
            click away.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-5">
            <Link
              href="/menu"
              className="group inline-flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-10 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(217,31,38,.35)]"
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
              className="inline-flex h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-10 text-lg font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:border-[#F6C453]/30"
            >
              <Phone size={20} />
              Call Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
