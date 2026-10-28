"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#080808]">
      <div className="absolute h-[500px] w-[500px] rounded-full bg-[#D91F26]/20 blur-[140px]" />

      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="relative h-28 w-28"
        >
          <Image
            src="/brand/logo.png"
            alt="Da Pizza Hub"
            fill
            priority
            sizes="112px"
            className="object-contain"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1,
          }}
          className="mt-8 font-heading text-3xl text-white"
        >
          Da Pizza Hub
        </motion.h2>
        <p className="mt-2 tracking-[0.35em] text-xs text-[#F6C453]">
          PURE VEG PIZZERIA
        </p>

        <div className="mt-10 h-1 w-64 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.3,
              ease: "easeInOut",
            }}
            className="h-full w-24 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FFB300]"
          />
        </div>
      </div>
    </div>
  );
}
