"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  PartyPopper,
  Phone,
  ArrowRight,
} from "lucide-react";
import type { Branch } from "@/lib/types";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

function WhatsAppWatermarkSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="absolute -right-8 -bottom-10 w-64 h-64 sm:w-80 sm:h-80 text-white/[0.14] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.09c-1.47 0-2.92-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a7.994 7.994 0 0 1-1.23-4.28c0-4.41 3.59-8 8.01-8 2.14 0 4.15.83 5.66 2.34a7.962 7.962 0 0 1 2.35 5.66c0 4.42-3.59 8-8.01 8zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

function ZomatoWatermarkSvg() {
  return (
    <div className="absolute -right-6 -bottom-6 pointer-events-none select-none transition-transform duration-500 group-hover:scale-105">
      <span className="font-heading font-black italic tracking-tighter text-8xl sm:text-[140px] leading-none text-white/[0.12] block">
        zomato
      </span>
    </div>
  );
}

function WhatsAppIconBadge({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className="text-white drop-shadow-md"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.09c-1.47 0-2.92-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a7.994 7.994 0 0 1-1.23-4.28c0-4.41 3.59-8 8.01-8 2.14 0 4.15.83 5.66 2.34a7.962 7.962 0 0 1 2.35 5.66c0 4.42-3.59 8-8.01 8zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

const SERVICE_CARDS = [
  {
    title: "Delivery",
    desc: "Hot & Fresh delivery at your doorstep across Hansi.",
    href: "/menu",
    color: "from-red-700/80 to-red-900/60",
    image: "/images/quick/delivery.webp",
    icon: Bike,
  },
  {
    title: "Takeaway",
    desc: "Skip the wait and pick up your hot order freshly packed.",
    href: "/menu",
    color: "from-orange-700/80 to-orange-900/60",
    image: "/images/quick/takeaway.webp",
    icon: ShoppingBag,
  },
  {
    title: "Dine In",
    desc: "Enjoy premium family dining with fresh baked pizza aroma.",
    href: "/contact",
    color: "from-green-700/80 to-green-900/60",
    image: "/images/quick/dinein.webp",
    icon: UtensilsCrossed,
  },
  {
    title: "Party Booking",
    desc: "Celebrate birthdays & group events with custom combos.",
    href: "/contact",
    color: "from-purple-700/80 to-purple-900/60",
    image: "/images/quick/party.webp",
    icon: PartyPopper,
  },
];

export function QuickOrder({ branches }: { branches: Branch[] }) {
  const primary =
    branches.find((b) => b.id === "Hansi") ?? branches[0];

  const waUrl = primary
    ? buildGeneralWhatsAppUrl(primary.whatsapp)
    : "https://wa.me/919911273199";
  const zomatoUrl =
    primary?.zomatoUrl || "https://www.zomato.com/hansi/da-pizza-hub-hansi-locality";
  const phone = primary?.phone || "9911273199";

  return (
    <section className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section 1: Services */}
        <div className="mb-12">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3 font-semibold">
            Services
          </p>
          <h2 className="text-4xl font-heading text-white">
            Choose How You&apos;d Like To Order
          </h2>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {SERVICE_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.06 * idx }}
              >
                <Link
                  href={card.href}
                  className="group relative overflow-hidden rounded-[28px] h-[290px] block border border-white/10"
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${card.color}`}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 flex flex-col justify-between h-full p-7">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 text-white">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-white">
                        {card.title}
                      </h3>
                      <p className="text-white/80 leading-relaxed text-sm">
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-white/80 font-semibold">
                        Explore
                      </span>
                      <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center group-hover:translate-x-1.5 duration-200 shadow-md">
                        <ArrowRight size={17} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Section 2: Order Channels (WhatsApp & Zomato full-box hero cards) */}
        <div className="mt-20 mb-8">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3 font-semibold">
            Order Channels
          </p>
          <h3 className="text-3xl sm:text-4xl font-heading text-white">
            Order on WhatsApp Or Zomato
          </h3>
        </div>

        {/* 2 Full-Box Hero Cards: WhatsApp & Zomato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: WhatsApp Full Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-[32px] min-h-[300px] sm:min-h-[320px] flex flex-col justify-between p-7 sm:p-9 border border-[#25D366]/40 bg-gradient-to-br from-[#25D366] via-[#128C4A] to-[#075E33] shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] block"
            >
              {/* Giant Full-Box WhatsApp Watermark Logo */}
              <WhatsAppWatermarkSvg />

              {/* Dark Gradient Overlay for razor-sharp text & CTA contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent pointer-events-none" />

              {/* Top Header Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                    <WhatsAppIconBadge size={28} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 block">
                      OFFICIAL CHANNEL
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Da Pizza Hub Hansi
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors duration-200">
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 my-4 sm:my-6">
                <h4 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2 drop-shadow-md">
                  Order on WhatsApp
                </h4>
                <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-md drop-shadow-sm font-medium">
                  Direct kitchen chat · Quick menu selection · Real-time order confirmation &amp; delivery updates.
                </p>
              </div>

              {/* Prominent High-Contrast CTA Button */}
              <div className="relative z-10 pt-4 border-t border-white/20">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-white text-black px-6 py-3 text-sm font-bold shadow-xl transition-transform group-hover:scale-105 duration-200">
                  <span>Chat on WhatsApp</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </a>
          </motion.div>

          {/* Card 2: Zomato Full Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <a
              href={zomatoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-[32px] min-h-[300px] sm:min-h-[320px] flex flex-col justify-between p-7 sm:p-9 border border-[#CB202D]/40 bg-gradient-to-br from-[#E23744] via-[#CB202D] to-[#8E101B] shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] block"
            >
              {/* Giant Full-Box Zomato Watermark Typography */}
              <ZomatoWatermarkSvg />

              {/* Dark Gradient Overlay for razor-sharp text & CTA contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent pointer-events-none" />

              {/* Top Header Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                    <span className="font-heading font-black italic tracking-tighter text-2xl text-white">
                      zomato
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 block">
                      TOP RATED IN HANSI
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Hansi Locality
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors duration-200">
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 my-4 sm:my-6">
                <h4 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2 drop-shadow-md">
                  Order on Zomato
                </h4>
                <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-md drop-shadow-sm font-medium">
                  Verified customer reviews · App-exclusive discounts · Live delivery tracking to your doorstep.
                </p>
              </div>

              {/* Prominent High-Contrast CTA Button */}
              <div className="relative z-10 pt-4 border-t border-white/20">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-white text-black px-6 py-3 text-sm font-bold shadow-xl transition-transform group-hover:scale-105 duration-200">
                  <span>Open Zomato App</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Direct Call Store Strip */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Prefer to speak directly with our Hansi kitchen team?
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Shop No. 60, Gandhi Market, Near Ambedkar Chowk · Call +91 {phone}
              </p>
            </div>
          </div>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 transition shrink-0"
          >
            <Phone size={14} />
            <span>Call +91 {phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
