"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, X, Menu, User, LogOut, MapPin, PackageCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { useCustomerStore } from "@/lib/customer-store";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Offers", href: "/offers" },
  { label: "Track Order", href: "/track" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.quantity, 0)
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const { customer, openAuthModal, logout, fetchProfile } = useCustomerStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setMounted(true);

    const onScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const badgeCount = mounted ? itemCount : 0;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavClick = (href: string) => {
    if (href === "/" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-4 z-[60] px-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div
          className={`relative flex h-20 items-center justify-between rounded-[28px] border transition-all duration-500 ${
            scrolled
              ? "border-white/15 bg-black/75 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,.55)]"
              : "border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,.35)]"
          } px-5 sm:px-7`}
        >
          <Link
            href="/"
            onClick={() => handleNavClick("/")}
            className="group flex items-center gap-3 sm:gap-4"
          >
            <Image
              src="/brand/logo.png"
              alt="Da Pizza Hub"
              width={56}
              height={56}
              priority
              className="rounded-full transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <h2 className="font-heading text-[24px] sm:text-[28px] leading-none text-white">
                Da Pizza Hub
              </h2>
              <p className="mt-1 text-[9px] sm:text-[10px] tracking-[0.35em] text-[#F6C453]">
                PURE VEG PIZZERIA
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="group relative py-2 text-sm font-semibold tracking-wide bg-transparent focus:outline-none"
                >
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-white/65 group-hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 right-0 -bottom-0.5 rounded-full origin-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "h-[2px] scale-x-100 opacity-100 bg-gradient-to-r from-[#F6C453] via-[#FF6B00] to-[#D91F26] shadow-[0_0_10px_rgba(246,196,83,0.45)]"
                        : "h-[1.5px] scale-x-0 opacity-0 bg-gradient-to-r from-[#F6C453]/80 to-[#FF6B00]/80 group-hover:scale-x-100 group-hover:opacity-75"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right side controls: Cart on left of Sign In, Sign In on the extreme right */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 1. Cart Button */}
            <button
              onClick={openCart}
              aria-label="Open Cart"
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-[#D91F26] hover:bg-[#D91F26]"
            >
              <ShoppingBag size={20} className="text-white" />
              {badgeCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC107] text-xs font-bold text-black"
                >
                  {badgeCount}
                </motion.span>
              )}
            </button>

            {/* 2. Customer Auth / Profile Button (Extreme Right) */}
            {mounted && (
              <div className="relative">
                {customer ? (
                  <div>
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 text-xs font-semibold text-white transition hover:border-[#D91F26] hover:bg-white/10"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-[10px] font-bold text-white uppercase">
                        {customer.name?.slice(0, 1) || "U"}
                      </div>
                      <span className="hidden sm:inline max-w-[90px] truncate text-white">
                        {customer.name?.split(" ")[0] || customer.phone}
                      </span>
                      <ChevronDown size={14} className="text-white/60" />
                    </button>

                    <AnimatePresence>
                      {userDropdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-[#141414] p-2 shadow-2xl backdrop-blur-2xl z-50"
                        >
                          <div className="border-b border-white/10 px-3 py-2.5">
                            <p className="text-xs font-bold text-white truncate">
                              {customer.name || "Customer"}
                            </p>
                            <p className="text-[11px] font-mono text-white/50 truncate">
                              {customer.phone ? `+91 ${customer.phone}` : customer.email || "Customer Account"}
                            </p>
                          </div>

                          <div className="py-1">
                            <Link
                              href="/account/orders"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                              <PackageCheck size={15} className="text-[#F6C453]" />
                              My Orders &amp; Bills
                            </Link>

                            <Link
                              href="/account/addresses"
                              onClick={() => setUserDropdown(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                              <MapPin size={15} className="text-[#FF6B00]" />
                              Saved Addresses
                            </Link>
                          </div>

                          <div className="border-t border-white/10 pt-1">
                            <button
                              onClick={() => {
                                setUserDropdown(false);
                                logout();
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                            >
                              <LogOut size={15} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => openAuthModal("phone")}
                    className="flex h-11 items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 text-xs font-semibold text-white transition hover:border-[#D91F26] hover:bg-white/10"
                  >
                    <User size={15} className="text-[#F6C453]" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-[#D91F26] hover:bg-[#D91F26] lg:hidden"
            >
              {mobileOpen ? (
                <X size={22} className="text-white" />
              ) : (
                <Menu size={22} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-24 z-40 lg:hidden"
          >
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 rounded-[28px] border border-white/10 bg-black/90 backdrop-blur-3xl p-6 shadow-[0_30px_80px_rgba(0,0,0,.6)]"
            >
              <div className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => {
                        handleNavClick(link.href);
                        setMobileOpen(false);
                      }}
                      className="group flex items-center justify-between rounded-xl px-4 py-3.5 bg-transparent transition-colors duration-300"
                    >
                      <span
                        className={`relative inline-block pb-1 font-semibold transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-white/70 group-hover:text-white"
                        }`}
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0 right-0 bottom-0 rounded-full origin-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isActive
                              ? "h-[2px] scale-x-100 opacity-100 bg-gradient-to-r from-[#F6C453] via-[#FF6B00] to-[#D91F26]"
                              : "h-[1.5px] scale-x-0 opacity-0 bg-gradient-to-r from-[#F6C453]/80 to-[#FF6B00]/80 group-hover:scale-x-100 group-hover:opacity-75"
                          }`}
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                {customer ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="font-semibold text-white">Hi, {customer.name || "Customer"}</span>
                      <span className="text-white/50 font-mono truncate max-w-[150px]">
                        {customer.phone ? `+91 ${customer.phone}` : customer.email}
                      </span>
                    </div>
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-xs font-semibold text-white"
                    >
                      <PackageCheck size={16} className="text-[#F6C453]" />
                      My Orders &amp; Bills
                    </Link>
                    <Link
                      href="/account/addresses"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-xs font-semibold text-white"
                    >
                      <MapPin size={16} className="text-[#FF6B00]" />
                      Saved Addresses
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      openAuthModal("phone");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    <User size={16} className="text-[#F6C453]" />
                    Sign In / Account
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
