"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import type { Branch } from "@/lib/types";
import { EXPO_EASE } from "@/components/motion/Reveal";

export function FloatingWhatsApp({ branches }: { branches: Branch[] }) {
  const [hovered, setHovered] = useState(false);
  const primary =
    branches.find((b) => b.id === "Hansi") ?? branches[0];
  if (!primary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="fixed bottom-24 left-4 sm:left-6 lg:bottom-6 z-[70]"
    >
      <div className="relative">
        <div className="pointer-events-none absolute -inset-2 rounded-full bg-[#25D366]/30 blur-xl" />
        <Link
          href={buildGeneralWhatsAppUrl(
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || primary.whatsapp
          )}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-14 sm:h-16 items-center overflow-hidden rounded-full bg-[#25D366] shadow-[0_15px_40px_rgba(37,211,102,.45)]"
        >
          <span className="absolute right-2 top-2 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#25D366] bg-white" />
          </span>

          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center">
            <MessageCircle size={26} className="text-white sm:hidden" />
            <MessageCircle size={30} className="hidden text-white sm:block" />
          </div>

          <motion.div
            animate={{ width: hovered ? 190 : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: EXPO_EASE }}
            className="hidden overflow-hidden whitespace-nowrap sm:block"
          >
            <div className="pr-7">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
                ORDER NOW
              </p>
              <h4 className="text-lg font-bold text-white">Chat on WhatsApp</h4>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
