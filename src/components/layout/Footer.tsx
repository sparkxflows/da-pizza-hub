"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Heart,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants";
import type { Branch } from "@/lib/types";
import { EXPO_EASE } from "@/components/motion/Reveal";

function FooterColumn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EXPO_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Footer({ branches }: { branches: Branch[] }) {
  const primary = branches.find((b) => b.id === "Hansi") ?? branches[0];

  return (
    <footer
      id="contact"
      className="relative bg-surface border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <FooterColumn>
            <div className="md:col-span-1">
              <Link
                href="/"
                className="flex items-center gap-3 mb-5 group w-fit"
              >
                <div className="relative w-11 h-11 shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-gold/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src="/brand/logo.png"
                    alt="Da Pizza Hub"
                    fill
                    sizes="44px"
                    className="relative rounded-full object-cover ring-1 ring-white/10 group-hover:ring-gold/40 transition-all duration-500"
                  />
                </div>
                <span className="font-display text-lg font-semibold">
                  {BRAND_CONFIG.name}
                </span>
              </Link>

              <p className="text-sm text-ink-secondary leading-relaxed max-w-xs mb-6">
                100% Pure Veg premium pizza, freshly baked and delivered
                piping hot across Hansi.
              </p>

              <div className="flex items-center gap-2.5">
                <a
                  href={BRAND_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 rounded-full bg-white/5 hover:bg-gold/15 text-ink-secondary hover:text-gold transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={BRAND_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2.5 rounded-full bg-white/5 hover:bg-gold/15 text-ink-secondary hover:text-gold transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={BRAND_CONFIG.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="p-2.5 rounded-full bg-white/5 hover:bg-gold/15 text-ink-secondary hover:text-gold transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Twitter size={16} />
                </a>
              </div>
            </div>
          </FooterColumn>

          <FooterColumn delay={0.08}>
            <h4 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Menu", href: "/menu" },
                { label: "Offers", href: "/#offers" },
                { label: "Track Order", href: "/track" },
                { label: "About Us", href: "/#about" },
                { label: "Contact", href: "/contact" },
                { label: "Staff Portal", href: "/admin" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-sm text-ink-secondary hover:text-white transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-gold mr-0 group-hover:mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn delay={0.16}>
            <h4 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-5">
              Policies
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Privacy Policy", href: "/policies/privacy" },
                { label: "Terms of Service", href: "/policies/terms" },
                { label: "Refund Policy", href: "/policies/refund" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-sm text-ink-secondary hover:text-white transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-gold mr-0 group-hover:mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn delay={0.24}>
            <h4 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-5">
              Reach Us
            </h4>
            {primary && (
              <>
                <p className="text-sm text-ink-secondary leading-relaxed mb-4 flex gap-2.5">
                  <MapPin
                    size={15}
                    className="shrink-0 mt-0.5 text-ink-muted"
                  />
                  {primary.address}
                </p>
                <a
                  href={`tel:${primary.phone}`}
                  className="inline-flex items-center gap-2.5 text-sm text-gold hover:text-gold-dim transition-colors duration-300"
                >
                  <Phone size={15} />
                  {primary.phone}
                </a>
              </>
            )}
          </FooterColumn>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights
            reserved.
          </p>
          <a
            href={BRAND_CONFIG.footerLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-secondary transition-colors duration-300"
          >
            Designed by{" "}
            <span className="text-ink-secondary group-hover:text-gold transition-colors duration-300 font-medium">
              {BRAND_CONFIG.footerLink.label}
            </span>
            <Heart
              size={11}
              className="fill-accent text-accent transition-transform duration-300 group-hover:scale-125"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
