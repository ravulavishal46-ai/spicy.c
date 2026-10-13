import { HeatExplorer } from "@/components/home/heat-explorer";
import { Hero } from "@/components/home/hero";
import { Bestsellers, CategoryRail, ComboBand, KitchenStory, OffersTeaser, ReviewWall } from "@/components/home/sections";
import { ForYou } from "@/components/shop/smart-reorder";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryRail />
      <HeatExplorer />
      <ForYou />
      <Bestsellers />
      <ComboBand />
      <KitchenStory />
      <ReviewWall />
      <OffersTeaser />
    </>
  );
}
