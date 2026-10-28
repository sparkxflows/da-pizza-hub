"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MapPin, Clock } from "lucide-react";
import type { Branch } from "@/lib/types";
import { EXPO_EASE } from "@/components/motion/Reveal";

export function ContactHero({ primaryBranch }: { primaryBranch: Branch }) {
  return (
    <section className="relative overflow-hidden pt-40 pb-28">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#090909]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0B] via-[#121212] to-[#080808]" />
        <div className="absolute -left-44 top-20 h-[500px] w-[500px] rounded-full bg-[#D91F26]/20 blur-[170px]" />
        <div className="absolute -right-44 bottom-0 h-[500px] w-[500px] rounded-full bg-[#F6C453]/10 blur-[180px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EXPO_EASE }}
          className="mx-auto max-w-5xl text-center"
        >
          <span className="inline-flex rounded-full border border-[#F6C453]/20 bg-[#F6C453]/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#F6C453]">
            CONTACT DA PIZZA HUB
          </span>

          <h1 className="mt-10 font-heading text-6xl leading-[0.9] text-white md:text-7xl xl:text-8xl">
            We&apos;d Love
            <br />
            To Hear
            <span className="block text-[#F6C453]">From You.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-white/65">
            Whether you&apos;re craving your favourite pizza, planning a party,
            have feedback, or simply want to say hello — our team is always
            ready to help.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-5">
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-8 py-5 font-semibold text-white transition hover:scale-105"
            >
              Order Online
              <ArrowRight size={18} />
            </Link>
            <a
              href={`tel:+91${primaryBranch.phone}`}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              <Phone size={20} />
              Call Now
            </a>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <Phone className="mb-5 text-[#F6C453]" size={28} />
              <h3 className="text-xl font-bold text-white">Call Us</h3>
              <p className="mt-3 text-white/60">
                +91 {primaryBranch.phone.slice(0, 5)}{" "}
                {primaryBranch.phone.slice(5)}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <MapPin className="mb-5 text-[#F6C453]" size={28} />
              <h3 className="text-xl font-bold text-white">Visit Store</h3>
              <p className="mt-3 text-white/60">Gandhi Market, Hansi</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <Clock className="mb-5 text-[#F6C453]" size={28} />
              <h3 className="text-xl font-bold text-white">Opening Hours</h3>
              <p className="mt-3 text-white/60">11:00 AM – 11:00 PM</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
