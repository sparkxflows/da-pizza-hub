import { Suspense } from "react";
import type { Metadata } from "next";
import { getMenuItems } from "@/lib/db";
import { SEED_MENU_ITEMS } from "@/lib/constants";
import { MenuPageClient } from "@/components/menu/MenuPageClient";

export const metadata: Metadata = {
  title: "Menu — Pizzas, Burgers, Pasta & More",
  description:
    "Explore Da Pizza Hub's 100% Pure Veg Menu — Royal Special Pizzas, Cheese Burst Pizzas, Burgers, Fries, Pasta, Wraps, Garlic Bread & Shakes.",
};

export const revalidate = 60;

export default async function MenuPage() {
  let items = await getMenuItems(false);
  if (!items || items.length === 0) {
    items = SEED_MENU_ITEMS;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <MenuPageClient items={items} />
    </Suspense>
  );
}
