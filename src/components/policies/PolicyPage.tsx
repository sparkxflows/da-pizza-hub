"use client";

import { motion } from "framer-motion";

export interface PolicySection {
  heading: string;
  content: string[];
}

export function PolicyPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: PolicySection[];
}) {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40 pb-16 sm:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-[#111111] to-[#090909]" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#F6C453]">
            Da Pizza Hub
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white break-words">
            {title}
          </h1>
          <p className="mt-5 sm:mt-8 text-base sm:text-lg leading-7 sm:leading-8 text-white/60">
            {description}
          </p>
        </motion.div>

        <div className="mt-10 sm:mt-16 space-y-8 sm:space-y-12">
          {sections.map((sec) => (
            <motion.div
              key={sec.heading}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8 backdrop-blur-xl"
            >
              <h2 className="mb-4 sm:mb-5 text-xl sm:text-3xl font-bold text-white">
                {sec.heading}
              </h2>
              <div className="space-y-4">
                {sec.content.map((para, idx) => (
                  <p
                    key={idx}
                    className="leading-7 sm:leading-8 text-sm sm:text-base text-white/60"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
