"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Tag,
  BarChart3,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { clearAdminToken, getClientAdminRole, type ClientAdminRole } from "@/lib/admin-client";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/users", label: "All Users", icon: Users },
  { href: "/admin/morning-report", label: "Daily Reports", icon: BarChart3 },
  { href: "/admin/sales", label: "Sales", icon: TrendingUp },
];

function isNavActive(
  pathname: string | null,
  item: (typeof NAV_ITEMS)[number]
) {
  if (!pathname) return false;
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [role, setRole] = useState<ClientAdminRole | null>(null);

  useEffect(() => {
    const currentRole = getClientAdminRole();
    setRole(currentRole);

    // Coupons and Users are exclusive to Super Admin
    if (
      currentRole === "admin" &&
      pathname &&
      (pathname.startsWith("/admin/coupons") ||
        pathname.startsWith("/admin/users"))
    ) {
      router.replace("/admin");
    }
  }, [pathname, router]);

  const visibleNavItems = useMemo(() => {
    if (role === "admin") {
      // Store Admin has everything EXCEPT Coupons and All Users
      return NAV_ITEMS.filter(
        (item) => !["/admin/coupons", "/admin/users"].includes(item.href)
      );
    }
    // Super Admin has all sections including Coupons and All Users
    return NAV_ITEMS;
  }, [role]);

  const isSuper = role === "super_admin";
  const portalLabel = isSuper ? "SUPER ADMIN PORTAL" : "STORE ADMIN PORTAL";
  const portalBadge = isSuper
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
    : "text-[#F6C453] bg-[#F6C453]/10 border-[#F6C453]/30";
  const homeLink = "/admin";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      clearAdminToken();
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0d0d0d]/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href={homeLink}
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/brand/logo.png"
            alt="Da Pizza Hub"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div>
            <p className="text-sm font-bold leading-none text-white">
              DA PIZZA HUB
            </p>
            <p
              className={`mt-1 inline-flex items-center gap-1 text-[8.5px] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded border ${portalBadge}`}
            >
              {isSuper ? <ShieldCheck size={10} /> : <Store size={10} />}
              {portalLabel}
            </p>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-[#111111] p-3 shadow-2xl lg:hidden">
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-white/10 pt-3 space-y-1">
            <Link
              href="/"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              <ExternalLink size={18} />
              View Storefront
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <LogOut size={18} />
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#101010] lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href={homeLink} className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt="Da Pizza Hub"
              width={44}
              height={44}
              className="rounded-full"
              priority
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-none text-white">
                Da Pizza Hub
              </p>
              <div className="mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[8.5px] font-bold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded border ${portalBadge}`}
                >
                  {isSuper ? <ShieldCheck size={10} /> : <Store size={10} />}
                  {portalLabel}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-1">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={18} />
            View Storefront
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
