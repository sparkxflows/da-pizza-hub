import type { Metadata } from "next";
import { getBranches } from "@/lib/db";
import { OrderConfirmedClient } from "@/components/order-confirmed/OrderConfirmedClient";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Track your live Da Pizza Hub order status.",
};

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage() {
  const branches = await getBranches();
  return <OrderConfirmedClient branches={branches} />;
}
