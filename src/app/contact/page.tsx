import type { Metadata } from "next";
import { getBranches } from "@/lib/db";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactCards } from "@/components/contact/ContactCards";
import { ContactMap } from "@/components/contact/ContactMap";

export const metadata: Metadata = {
  title: "Contact Us — Da Pizza Hub Hansi",
  description:
    "Reach Da Pizza Hub at Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana for orders, party bookings, feedback or enquiries.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const branches = await getBranches();
  const primaryBranch =
    branches.find((b) => b.id === "Hansi") ?? branches[0];

  if (!primaryBranch) return null;

  return (
    <main className="min-h-screen bg-[#090909]">
      <ContactHero primaryBranch={primaryBranch} />
      <ContactCards branches={branches} />
      <ContactMap primaryBranch={primaryBranch} />
    </main>
  );
}
