import type { Metadata } from "next";
import { getCoupons, getMenuItems } from "@/lib/db";
import { OffersPageClient } from "@/components/offers/OffersPageClient";

export const metadata: Metadata = {
  title: "Special Offers & Promo Codes — Da Pizza Hub Hansi",
  description:
    "Check out latest discount coupons, promo codes, and special pizza deals at Da Pizza Hub Hansi. Save up to 30% OFF on your order.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OffersPage() {
  const [coupons, menuItems] = await Promise.all([
    getCoupons(),
    getMenuItems(false),
  ]);

  const combos = menuItems.filter((item) => item.id.includes("combo"));

  return <OffersPageClient coupons={coupons} combos={combos} />;
}
