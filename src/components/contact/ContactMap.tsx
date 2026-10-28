"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import type { Branch } from "@/lib/types";

export function ContactMap({ primaryBranch }: { primaryBranch: Branch }) {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#F6C453]">
            VISIT OUR STORE
          </span>
          <h2 className="mt-5 font-heading text-5xl text-white lg:text-6xl">
            Find Da Pizza Hub
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Visit our restaurant and enjoy freshly baked pizzas, burgers, pasta
            and much more.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <iframe
              title="Da Pizza Hub Map"
              src={`https://www.google.com/maps?q=${primaryBranch.lat},${primaryBranch.lng}&z=16&output=embed`}
              className="h-[550px] w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-between rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div>
              <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D91F26] to-[#FF6B00]">
                <MapPin size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Da Pizza Hub</h3>
              <p className="mt-5 leading-8 text-white/60">
                {primaryBranch.address}
              </p>
            </div>

            <div className="my-10 space-y-6">
              <div className="flex gap-4">
                <Phone className="mt-1 text-[#F6C453]" size={20} />
                <div>
                  <p className="font-semibold text-white">Phone</p>
                  <p className="text-white/60">
                    +91 {primaryBranch.phone.slice(0, 5)}{" "}
                    {primaryBranch.phone.slice(5)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="mt-1 text-[#F6C453]" size={20} />
                <div>
                  <p className="font-semibold text-white">Opening Hours</p>
                  <p className="text-white/60">Daily • 11 AM – 11 PM</p>
                </div>
              </div>
            </div>

            <a
              href={primaryBranch.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-lg font-semibold text-white transition hover:scale-[1.02]"
            >
              <Navigation size={20} />
              Get Directions
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
