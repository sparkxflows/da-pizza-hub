"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Leaf, ShieldCheck, Heart, MapPin, ArrowRight } from "lucide-react";
import { EXPO_EASE } from "@/components/motion/Reveal";

function WhatsAppLogo({ className = "w-5 h-5", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.09c-1.47 0-2.92-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a7.994 7.994 0 0 1-1.23-4.28c0-4.41 3.59-8 8.01-8 2.14 0 4.15.83 5.66 2.34a7.962 7.962 0 0 1 2.35 5.66c0 4.42-3.59 8-8.01 8zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return {
    ref,
    style: {
      transform: `translate(${pos.x}px, ${pos.y}px)`,
    },
    onMouseMove(e: React.MouseEvent<T>) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        x: (e.clientX - (rect.left + rect.width / 2)) * strength,
        y: (e.clientY - (rect.top + rect.height / 2)) * strength,
      });
    },
    onMouseLeave() {
      setPos({ x: 0, y: 0 });
    },
  };
}

const TRUST_BADGES = [
  { icon: Leaf, title: "100% Pure Veg" },
  { icon: ShieldCheck, title: "Hygienic Kitchen" },
  { icon: Heart, title: "Loved by Thousands" },
  { icon: MapPin, title: "Serving Across Hansi" },
];

const WHATSAPP_ORDER_URL =
  "https://wa.me/919911273199?text=" +
  encodeURIComponent("Hi Da Pizza Hub! I'd like to place an order.");

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 90, damping: 22, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const pctX = useTransform(smoothX, (v) => `${v * 100}%`);
  const pctY = useTransform(smoothY, (v) => `${v * 100}%`);

  const radialBg = useTransform(
    [pctX, pctY],
    ([x, y]) =>
      `radial-gradient(650px circle at ${x} ${y}, rgba(255,255,255,0.3), transparent 60%)`
  );

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const primaryCta = useMagnetic<HTMLAnchorElement>(0.25);

  return (
    <section
      ref={sectionRef}
      onPointerMove={(e) => {
        if (reducedMotion) return;
        const rect = sectionRef.current?.getBoundingClientRect();
        if (rect) {
          mouseX.set((e.clientX - rect.left) / rect.width);
          mouseY.set((e.clientY - rect.top) / rect.height);
        }
      }}
      onPointerLeave={() => {
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
      className="relative min-h-screen w-full overflow-hidden bg-bg"
    >
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: EXPO_EASE }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="/images/hero/hero-main.webp"
            alt="Freshly baked premium pure veg pizza with melted cheese pull, wood-fired oven in background"
            fill
            priority
            className="object-cover object-[75%_center] sm:object-center"
            sizes="100vw"
          />
        </motion.div>

        <div
          className="absolute inset-0 mix-blend-multiply opacity-60"
          style={{
            background:
              "linear-gradient(160deg, rgba(20,8,6,0.5) 0%, rgba(9,9,9,0) 45%, rgba(9,9,9,0.35) 100%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
          style={{ background: radialBg }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,5,5,0.94)] via-[rgba(5,5,5,0.68)] to-[rgba(5,5,5,0.2)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-bg/25" />
      <div className="absolute inset-0 shadow-[inset_0_0_220px_80px_rgba(5,5,5,0.55)] pointer-events-none" />

      <div className="relative z-10 min-h-screen max-w-7xl mx-auto px-6 lg:px-8 flex items-center py-32 lg:py-24">
        <div className="w-full max-w-[660px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EXPO_EASE }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/70" />
            <span className="inline-flex items-center gap-2 font-sans text-[11px] font-light uppercase tracking-[0.3em] text-gold whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              Hansi&apos;s Favourite
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
          </motion.div>

          <h1 className="font-heading leading-[0.9] tracking-[-0.02em] mb-7 overflow-hidden">
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EXPO_EASE }}
              className="block text-white text-[2.6rem] sm:text-6xl xl:text-[5.2rem]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
            >
              100% Pure Veg
            </motion.span>
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EXPO_EASE }}
              className="block text-[2.6rem] sm:text-6xl xl:text-[5.2rem] bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FF6B00 0%, #D91F26 55%, #A8161C 100%)",
                filter: "drop-shadow(0 4px 28px rgba(217,31,38,0.35))",
              }}
            >
              Pizza Experience
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EXPO_EASE }}
            className="font-sans text-white/95 text-[18px] font-medium mb-3"
          >
            Fresh Dough <span className="text-gold mx-1">•</span> Premium Cheese{" "}
            <span className="text-gold mx-1">•</span> Farm Fresh Ingredients
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: EXPO_EASE }}
            className="font-script text-leaf text-3xl sm:text-4xl mb-10"
            style={{ textShadow: "0 2px 16px rgba(116,192,67,0.25)" }}
          >
            Made Fresh on Every Order
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: EXPO_EASE }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <a
              href={WHATSAPP_ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              ref={primaryCta.ref}
              onMouseMove={primaryCta.onMouseMove}
              onMouseLeave={primaryCta.onMouseLeave}
              style={{
                ...primaryCta.style,
                boxShadow:
                  "0 10px 32px rgba(217,31,38,0.4), 0 2px 8px rgba(0,0,0,0.3)",
              }}
              className="magnetic-btn group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold overflow-hidden hover:scale-[1.06] active:scale-95 transition-transform duration-300"
            >
              <span
                className="absolute inset-0 transition-[background-position] duration-700 ease-out bg-[length:200%_100%] bg-[position:0%_50%] group-hover:bg-[position:100%_50%]"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #D91F26 0%, #FF6B00 50%, #D91F26 100%)",
                }}
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
              <WhatsAppLogo size={20} className="relative text-white" />
              <span className="relative">Order on WhatsApp</span>
              <motion.span
                className="relative flex items-center justify-center"
                whileHover={{ x: 3 }}
              >
                <ArrowRight size={17} />
              </motion.span>
            </a>

            <Link
              href="/menu"
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#D91F26] to-[#FF6B00] hover:from-[#e52830] hover:to-[#ff7b1a] shadow-[0_10px_30px_rgba(217,31,38,0.4)] hover:scale-[1.05] active:scale-95 transition-all duration-200 overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative">Explore Menu</span>
              <motion.span
                className="relative flex items-center justify-center"
                whileHover={{ x: 3 }}
              >
                <ArrowRight size={17} />
              </motion.span>
            </Link>
          </motion.div>

          {/* Clean inline points list with fast, snappy hover enlargement */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: EXPO_EASE }}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/10"
          >
            {TRUST_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  whileHover={{
                    scale: 1.15,
                    y: -3,
                    transition: { duration: 0.12, ease: "easeOut" },
                  }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="flex items-center gap-2.5 text-white/90 cursor-pointer select-none group origin-left"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/15 text-gold shrink-0 ring-1 ring-gold/30 group-hover:bg-gold group-hover:text-black group-hover:ring-gold shadow-sm group-hover:shadow-[0_0_18px_rgba(246,196,83,0.7)] group-hover:scale-110 transition-all duration-150">
                    <Icon size={16} strokeWidth={2.4} />
                  </span>
                  <span className="text-sm sm:text-[15px] font-bold tracking-wide text-white group-hover:text-[#F6C453] transition-colors duration-150 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {badge.title}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}
