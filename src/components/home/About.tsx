"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Quote } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants";
import { EXPO_EASE, Reveal } from "@/components/motion/Reveal";

export function About() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card-hover">
                <Image
                  src={BRAND_CONFIG.founders.photo}
                  alt={BRAND_CONFIG.founders.names}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, ease: EXPO_EASE }}
                className="absolute -bottom-6 -right-4 sm:-right-8 glass rounded-2xl px-6 py-5 shadow-card-hover flex items-center gap-3"
              >
                <Award size={22} className="text-gold shrink-0" />
                <div>
                  <span className="block text-2xl font-display font-semibold leading-none text-[#F6C453]">
                    10+
                  </span>
                  <span className="block text-[11px] text-ink-secondary uppercase tracking-wide mt-1">
                    Years of Craft
                  </span>
                </div>
              </motion.div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
              Our Story
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-6 text-balance">
              A family recipe, 10 years in the making
            </h2>
            <Quote size={28} className="text-gold/40 mb-3" />

            <div className="space-y-4 mb-8">
              {BRAND_CONFIG.founders.story.map((para, idx) => (
                <p key={idx} className="text-ink-secondary leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <span className="font-display text-lg text-gold">DPH</span>
              </div>
              <div>
                <span className="block font-semibold text-ink-primary">
                  {BRAND_CONFIG.founders.names}
                </span>
                <span className="block text-xs text-ink-secondary">
                  Gandhi Market, Hansi (Haryana)
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
