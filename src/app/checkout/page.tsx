import type { Metadata } from "next";
import { getBranches } from "@/lib/db";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your pure-veg pizza order from Da Pizza Hub.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const branches = await getBranches();
  return <CheckoutClient branches={branches} />;
}
