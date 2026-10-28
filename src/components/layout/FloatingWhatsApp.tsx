"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import type { Branch } from "@/lib/types";
import { EXPO_EASE } from "@/components/motion/Reveal";

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className="text-white shrink-0"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.09c-1.47 0-2.92-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a7.994 7.994 0 0 1-1.23-4.28c0-4.41 3.59-8 8.01-8 2.14 0 4.15.83 5.66 2.34a7.962 7.962 0 0 1 2.35 5.66c0 4.42-3.59 8-8.01 8zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

export function FloatingWhatsApp({ branches }: { branches: Branch[] }) {
  const [hovered, setHovered] = useState(false);
  const [autoExpanded, setAutoExpanded] = useState(false);

  const primary =
    branches.find((b) => b.id === "Hansi") ?? branches[0];

  // Periodic reminder: automatically expand every ~3.5 seconds, stay open for 2.5s, then collapse
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const runCycle = () => {
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setAutoExpanded(true);

        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          setAutoExpanded(false);
          runCycle();
        }, 2500);
      }, 3500);
    };

    // Initial trigger after 2 seconds
    timeoutId = setTimeout(() => {
      if (!isMounted) return;
      setAutoExpanded(true);
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setAutoExpanded(false);
        runCycle();
      }, 2500);
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (!primary) return null;

  const isExpanded = hovered || autoExpanded;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-24 left-4 sm:left-6 lg:bottom-6 z-[70]"
    >
      <div className="relative">
        {/* Subtle, soft glow ring */}
        <div className="pointer-events-none absolute -inset-1 rounded-full bg-[#25D366]/20 blur-md" />

        <Link
          href={buildGeneralWhatsAppUrl(
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || primary.whatsapp
          )}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-14 sm:h-16 items-center overflow-hidden rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,.3)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Online green indicator dot */}
          <span className="absolute right-2 top-2 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#25D366] bg-white" />
          </span>

          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center">
            <WhatsAppIcon size={26} />
          </div>

          <motion.div
            animate={{ width: isExpanded ? 180 : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.35, ease: EXPO_EASE }}
            className="hidden overflow-hidden whitespace-nowrap sm:block"
          >
            <div className="pr-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">
                QUICK ORDER
              </p>
              <h4 className="text-base font-bold text-white">Chat on WhatsApp</h4>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
