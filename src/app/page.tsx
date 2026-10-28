import { getBranches, getMenuItems } from "@/lib/db";
import { Hero } from "@/components/home/Hero";
import { QuickOrder } from "@/components/home/QuickOrder";
import { Offers } from "@/components/home/Offers";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestSellers } from "@/components/home/BestSellers";
import { Combos } from "@/components/home/Combos";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { About } from "@/components/home/About";
import { Reviews } from "@/components/home/Reviews";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";

export const revalidate = 60;

export default async function HomePage() {
  const [branches, menuItems] = await Promise.all([
    getBranches(),
    getMenuItems(false),
  ]);
  const primaryBranch =
    branches.find((b) => b.id === "Hansi") ?? branches[0];

  const bestSellers = menuItems.filter((item) => item.isBestSeller);
  const combos = menuItems.filter((item) => item.id.includes("combo"));

  return (
    <>
      <Hero />
      <QuickOrder branches={branches} />
      <Offers />
      <FeaturedCategories menuItems={menuItems} />
      <BestSellers items={bestSellers} />
      <Combos combos={combos} />
      <WhyChooseUs />
      <About />
      <Reviews />
      <InstagramGallery />
      <FAQ />
      {primaryBranch && <FinalCTA primaryBranch={primaryBranch} />}
    </>
  );
}
