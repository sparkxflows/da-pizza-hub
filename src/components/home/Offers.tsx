"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const OFFERS = [
  {
    title: "30% OFF",
    subtitle: "On Your First Order",
    description:
      "Get flat 30% OFF on your first online order with premium handcrafted pizzas.",
    image: "/images/offers/offer-1.webp",
    badge: "LIMITED TIME",
    button: "Claim Offer",
    gradient: "from-red-700/90 via-red-900/70 to-black/90",
  },
  {
    title: "FREE DELIVERY",
    subtitle: "Within 3 KM in Hansi",
    description:
      "Hot, fresh and fast delivery right to your doorstep — 100% free within 3 km from our Gandhi Market store.",
    image: "/images/offers/offer-2.webp",
    badge: "🔥 HOTTEST DEAL IN HANSI",
    button: "Order Free Delivery Now",
    gradient: "from-emerald-700/95 via-green-950/80 to-black/95",
  },
  {
    title: "FAMILY COMBO",
    subtitle: "Starting @ ₹499",
    description:
      "2 Pizzas + Garlic Bread + Cold Drink. Perfect for weekend family nights.",
    image: "/images/offers/offer-3.webp",
    badge: "BEST VALUE",
    button: "View Combo",
    gradient: "from-orange-700/90 via-red-800/70 to-black/90",
  },
];

export function Offers() {
  return (
    <section
      id="offers"
      className="py-24 lg:py-32 bg-gradient-to-b from-bg via-[#0c0c0c] to-bg relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-600/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
          <div>
            <p className="uppercase tracking-[0.35em] text-[#F6C453] text-xs mb-3 font-semibold">
              SPECIAL OFFERS
            </p>
            <h2 className="font-heading text-5xl lg:text-6xl text-white">
              Today&apos;s Best Deals
            </h2>
          </div>
          <Link
            href="/menu"
            className="group flex items-center gap-2 font-semibold text-[#F6C453] hover:text-white transition-colors"
          >
            <span>View Full Menu</span>
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Clean, balanced 3-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {OFFERS.map((offer, idx) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 * idx }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-500 h-[440px] flex flex-col justify-between hover:border-white/20"
            >
              <Image
                src={offer.image}
                alt={offer.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition duration-700"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${offer.gradient}`}
              />
              <div className="absolute inset-0 bg-black/25" />

              <div className="relative z-10 flex h-full flex-col justify-between p-7 sm:p-8">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      <Sparkles size={12} className="text-[#F6C453]" />
                      {offer.badge}
                    </span>
                  </div>

                  <h3 className="font-heading text-4xl sm:text-5xl leading-none mt-5 text-white">
                    {offer.title}
                  </h3>
                  <p className="text-xl mt-3 font-medium text-[#F6C453]">
                    {offer.subtitle}
                  </p>
                  <p className="text-white/80 mt-3 leading-relaxed text-sm max-w-xs">
                    {offer.description}
                  </p>
                </div>

                <Link
                  href="/menu"
                  className="inline-flex w-fit items-center gap-3 rounded-full bg-white text-black px-7 py-3.5 font-bold transition-all duration-300 hover:bg-[#F6C453] hover:scale-105 active:scale-95 shadow-xl"
                >
                  <span>{offer.button}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
