"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import type { Branch } from "@/lib/types";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

export function ContactHero({ primaryBranch }: { primaryBranch: Branch }) {
  const waUrl = buildGeneralWhatsAppUrl(primaryBranch?.whatsapp || "919911273199");
  const phone = primaryBranch?.phone || "9911273199";

  return (
    <section className="relative overflow-hidden pt-40 sm:pt-44 lg:pt-48 pb-6 bg-[#090909]">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex rounded-full border border-[#F6C453]/25 bg-[#F6C453]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#F6C453]">
            CONTACT US
          </span>

          <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Get In Touch With <span className="text-[#F6C453]">Da Pizza Hub</span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-white/60 leading-relaxed">
            Have a question, craving freshly baked pizza, or want to order directly? Reach our Gandhi Market, Hansi team through any of the channels below.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <span>Explore Menu</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10"
            >
              <Phone size={15} />
              <span>Call: +91 {phone.slice(0, 5)} {phone.slice(5)}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
