"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileOrderBar } from "@/components/layout/MobileOrderBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { AIAssistant } from "@/components/layout/AIAssistant";
import { AuthModal } from "@/components/auth/AuthModal";
import type { Branch } from "@/lib/types";

export function StorefrontChrome({
  branches,
  children,
}: {
  branches: Branch[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer branches={branches} />
      <CartDrawer />
      <AuthModal />
      <MobileOrderBar />
      <FloatingWhatsApp branches={branches} />
      <AIAssistant />
    </>
  );
}
