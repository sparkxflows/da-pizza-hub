"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck, ExternalLink, ThumbsUp } from "lucide-react";
import {
  Reveal,
  StaggerContainer,
  staggerItemVariants,
} from "@/components/motion/Reveal";

const HANSI_GOOGLE_REVIEWS = [
  {
    name: "Diya Baljeet",
    location: "Google Reviewer • Hansi",
    rating: 5,
    date: "Recent Google Review",
    text: "Best pizza in Hansi, hands down! Very good service, super clean sitting place. The cheese burst pizza is delicious and arrives steaming hot. Super like 5-star!",
    verified: true,
  },
  {
    name: "Nikhil Rawal",
    location: "Verified Foodie • Hansi",
    rating: 5,
    date: "Google Verified",
    text: "I was pleasantly surprised by the excellent food quality and portion sizes. The pizza slices are huge, toppings are generous, and pasta is amazing. Best place in Hansi for family cravings!",
    verified: true,
  },
  {
    name: "Shubham Singla",
    location: "Local Guide • Ambedkar Chowk",
    rating: 5,
    date: "Google Reviewer",
    text: "Consistent quality every single time we order. Attentive and courteous staff, prompt delivery near Ambedkar Chowk, and the crust has the perfect crunch.",
    verified: true,
  },
  {
    name: "Suresh Rajput",
    location: "Verified Customer • Gandhi Market",
    rating: 5,
    date: "Google Verified",
    text: "Freshly baked pizza with authentic taste. Fast delivery right to Gandhi Market. Love their Tandoori Paneer and Stuffed Garlic Bread. Highly recommended!",
    verified: true,
  },
];

export function Reviews() {
  return (
    <section className="py-24 lg:py-32 bg-[#0E0E0E] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[350px] bg-[#F6C453]/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-[#F6C453] text-xs font-semibold tracking-[0.35em] uppercase mb-3">
                REAL GOOGLE FEEDBACK • HANSI
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl text-white">
                What Hansi Says About Us
              </h2>
            </div>

            {/* Official Google & Delivery Rating Scorecard */}
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black font-bold text-sm shadow-md">
                  G
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#F6C453]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={14} className="fill-[#F6C453]" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#F6C453] transition-colors block mt-0.5">
                    4.3★ (1,244+ Google Reviews)
                  </span>
                </div>
                <ExternalLink size={14} className="text-white/40 group-hover:text-white transition-colors ml-1" />
              </a>

              <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-white">
                  4.6★ <span className="text-white/60 font-normal">on Zomato (9.5k+ orders)</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Real Customer Review Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HANSI_GOOGLE_REVIEWS.map((rev) => (
            <motion.div
              key={rev.name}
              variants={staggerItemVariants}
              whileHover={{ y: -6 }}
              className="group bg-[#161616] rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-[#F6C453]/40 transition-all duration-500 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-[#F6C453]">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} size={14} className="fill-[#F6C453]" />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {rev.date}
                  </span>
                </div>

                <p className="text-sm text-white/80 leading-relaxed mb-6 font-normal">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">
                      {rev.name}
                    </span>
                    {rev.verified && (
                      <BadgeCheck size={15} className="text-[#F6C453]" />
                    )}
                  </div>
                  <span className="text-xs text-white/40 block mt-0.5">
                    {rev.location}
                  </span>
                </div>
                <ThumbsUp size={14} className="text-white/30 group-hover:text-[#F6C453] transition-colors" />
              </div>
            </motion.div>
          ))}
        </StaggerContainer>

        <Reveal delay={0.2} className="mt-12 flex justify-center">
          <a
            href="https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/15 bg-white/5 text-white text-sm font-semibold hover:border-[#F6C453] hover:bg-[#F6C453] hover:text-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
          >
            <span>Read All 1,244+ Google Reviews</span>
            <ExternalLink size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
