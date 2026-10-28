import type { Metadata } from "next";
import { getBranches } from "@/lib/db";
import { PRIMARY_STORE } from "@/lib/constants";
import { TrackOrderClient } from "@/components/track/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Order | Da Pizza Hub – Hansi",
  description:
    "Live real-time order tracking for Da Pizza Hub Hansi. Watch your fresh pizza go from the oven straight to your doorstep.",
};

export const dynamic = "force-dynamic";

export default async function TrackPage() {
  const branches = await getBranches();
  const primaryBranch =
    branches.find((b) => b.id === "Hansi") ?? branches[0] ?? PRIMARY_STORE;

  return <TrackOrderClient primaryBranch={primaryBranch} />;
}
