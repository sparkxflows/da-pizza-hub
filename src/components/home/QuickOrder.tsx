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
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import type { Branch } from "@/lib/types";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

function SwiggyBadge() {
  return (
    <span className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-[#FC8019] text-base sm:text-xl font-bold mb-3 sm:mb-5">
      S
    </span>
  );
}

function ZomatoBadge() {
  return (
    <span className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-[#E23744] text-base sm:text-xl font-bold mb-3 sm:mb-5">
      Z
    </span>
  );
}

const SERVICE_CARDS = [
  {
    title: "Delivery",
    desc: "Hot & Fresh delivery at your doorstep.",
    href: "/menu",
    color: "from-red-700/80 to-red-900/60",
    image: "/images/quick/delivery.webp",
    icon: Bike,
  },
  {
    title: "Takeaway",
    desc: "Skip the wait and pick up your order.",
    href: "/menu",
    color: "from-orange-700/80 to-orange-900/60",
    image: "/images/quick/takeaway.webp",
    icon: ShoppingBag,
  },
  {
    title: "Dine In",
    desc: "Enjoy premium dining with family & friends.",
    href: "/contact",
    color: "from-green-700/80 to-green-900/60",
    image: "/images/quick/dinein.webp",
    icon: UtensilsCrossed,
  },
  {
    title: "Party Booking",
    desc: "Celebrate birthdays & events with us.",
    href: "/contact",
    color: "from-purple-700/80 to-purple-900/60",
    image: "/images/quick/party.webp",
    icon: PartyPopper,
  },
];

export function QuickOrder({ branches }: { branches: Branch[] }) {
  const primary =
    branches.find((b) => b.id === "Hansi") ?? branches[0];

  const channels = primary
    ? [
        {
          title: "Call Us",
          desc: "Speak to us directly to place your order.",
          href: `tel:${primary.phone}`,
          external: false,
          color: "from-blue-700/80 to-blue-900/60",
          icon: Phone,
          isBadge: false as const,
        },
        {
          title: "WhatsApp",
          desc: "Chat with us to order in a few taps.",
          href: buildGeneralWhatsAppUrl(primary.whatsapp),
          external: true,
          color: "from-[#128C4A]/80 to-[#075E33]/60",
          icon: MessageCircle,
          isBadge: false as const,
        },
        ...(primary.swiggyUrl
          ? [
              {
                title: "Swiggy",
                desc: "Order through Swiggy for fast delivery.",
                href: primary.swiggyUrl,
                external: true,
                color: "from-[#FC8019]/80 to-[#B85A0F]/60",
                icon: SwiggyBadge,
                isBadge: true as const,
              },
            ]
          : []),
        ...(primary.zomatoUrl
          ? [
              {
                title: "Zomato",
                desc: "Order through Zomato for fast delivery.",
                href: primary.zomatoUrl,
                external: true,
                color: "from-[#E23744]/80 to-[#9E1F29]/60",
                icon: ZomatoBadge,
                isBadge: true as const,
              },
            ]
          : []),
      ]
    : [];

  return (
    <section className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Quick Order
          </p>
          <h2 className="text-4xl font-heading">
            Choose How You&apos;d Like To Order
          </h2>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {SERVICE_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
              >
                <Link
                  href={card.href}
                  className="group relative overflow-hidden rounded-3xl h-[290px] block border border-white/10"
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-110 duration-700"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${card.color}`}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 flex flex-col justify-between h-full p-7">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                      <p className="text-white/75 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm uppercase tracking-widest text-white/70">
                        Explore
                      </span>
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:translate-x-2 duration-300">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Order Now
          </p>
          <h3 className="text-2xl font-heading mb-8">
            Call, Chat, Or Order On Your Favourite App
          </h3>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {channels.map((ch, idx) => {
            const Icon = ch.icon;
            const extProps = ch.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <motion.div
                key={ch.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
              >
                <a
                  href={ch.href}
                  {...extProps}
                  className={`group relative overflow-hidden rounded-3xl h-[240px] sm:h-[260px] block border border-white/10 bg-gradient-to-br ${ch.color}`}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-7">
                    <div>
                      {ch.isBadge ? (
                        <Icon />
                      ) : (
                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 sm:mb-5">
                          <Icon size={20} className="sm:hidden" />
                          <Icon size={24} className="hidden sm:block" />
                        </div>
                      )}
                      <h3 className="text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2">
                        {ch.title}
                      </h3>
                      <p className="text-white/75 leading-snug sm:leading-relaxed text-xs sm:text-sm line-clamp-2">
                        {ch.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm uppercase tracking-widest text-white/70">
                        {ch.external ? "Open" : "Call"}
                      </span>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:translate-x-2 duration-300">
                        <ArrowRight size={16} className="sm:hidden" />
                        <ArrowRight size={18} className="hidden sm:block" />
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
