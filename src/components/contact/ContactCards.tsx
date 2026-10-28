"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  ArrowUpRight,
  Clock,
  Mail,
} from "lucide-react";
import type { Branch } from "@/lib/types";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

function WhatsAppWatermark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="absolute -right-6 -bottom-8 w-48 h-48 text-white/[0.15] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.09c-1.47 0-2.92-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a7.994 7.994 0 0 1-1.23-4.28c0-4.41 3.59-8 8.01-8 2.14 0 4.15.83 5.66 2.34a7.962 7.962 0 0 1 2.35 5.66c0 4.42-3.59 8-8.01 8zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

function ZomatoWatermark() {
  return (
    <div className="absolute -right-4 -bottom-4 pointer-events-none select-none transition-transform duration-500 group-hover:scale-105">
      <span className="font-heading font-black italic tracking-tighter text-7xl sm:text-8xl leading-none text-white/[0.16] block">
        zomato
      </span>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="currentColor" className="text-white">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.09c-1.47 0-2.92-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a7.994 7.994 0 0 1-1.23-4.28c0-4.41 3.59-8 8.01-8 2.14 0 4.15.83 5.66 2.34a7.962 7.962 0 0 1 2.35 5.66c0 4.42-3.59 8-8.01 8zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

export function ContactCards({ branches }: { branches: Branch[] }) {
  const primary = branches.find((b) => b.id === "Hansi") ?? branches[0];
  const waUrl = buildGeneralWhatsAppUrl(primary?.whatsapp || "919911273199");
  const phone = primary?.phone || "9911273199";
  const mapsUrl = primary?.mapsUrl || "https://maps.app.goo.gl/QkPF8iK4bk3E6MpB6";
  const zomatoUrl =
    primary?.zomatoUrl ||
    "https://www.zomato.com/hansi/da-pizza-hub-hansi-locality";

  return (
    <section className="relative py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. WhatsApp Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#25D366] via-[#20b858] to-[#128C7E] p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl min-h-[220px]"
            >
              <WhatsAppWatermark />
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md mb-4 border border-white/20">
                  <WhatsAppIcon />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                  FAST RESPONSE
                </span>
                <h3 className="text-2xl font-bold font-heading text-white mt-1">
                  WhatsApp
                </h3>
                <p className="mt-1 text-xs text-white/90">
                  Quick chat for direct orders, customization &amp; queries.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-white group-hover:underline">
                <span>Chat on WhatsApp</span>
                <ArrowUpRight size={14} />
              </div>
            </a>
          </motion.div>

          {/* 2. Direct Phone Call Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <a
              href={`tel:+91${phone}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#D91F26] via-[#B3141A] to-[#800C10] p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl min-h-[220px]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md mb-4 border border-white/20">
                  <Phone size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                  STORE HOTLINE
                </span>
                <h3 className="text-2xl font-bold font-heading text-white mt-1">
                  Call Us
                </h3>
                <p className="mt-1 text-xs text-white/90">
                  +91 {phone.slice(0, 5)} {phone.slice(5)}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-white group-hover:underline">
                <span>Tap to Call Store</span>
                <ArrowUpRight size={14} />
              </div>
            </a>
          </motion.div>

          {/* 3. Visit Store / Google Maps Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9800] via-[#F57C00] to-[#E65100] p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl min-h-[220px]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md mb-4 border border-white/20">
                  <MapPin size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                  STORE LOCATION
                </span>
                <h3 className="text-2xl font-bold font-heading text-white mt-1">
                  Visit Store
                </h3>
                <p className="mt-1 text-xs text-white/90">
                  Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-white group-hover:underline">
                <span>Open in Google Maps</span>
                <ArrowUpRight size={14} />
              </div>
            </a>
          </motion.div>

          {/* 4. Order on Zomato Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <a
              href={zomatoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#E23744] via-[#cb202d] to-[#99151e] p-7 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl min-h-[220px]"
            >
              <ZomatoWatermark />
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md mb-4 border border-white/20">
                  <span className="font-heading font-black italic text-lg text-white">
                    z
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                  PARTNER DELIVERY
                </span>
                <h3 className="text-2xl font-bold font-heading text-white mt-1">
                  Zomato
                </h3>
                <p className="mt-1 text-xs text-white/90">
                  Order Da Pizza Hub favorites on Zomato across Hansi.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-white group-hover:underline">
                <span>View on Zomato</span>
                <ArrowUpRight size={14} />
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
