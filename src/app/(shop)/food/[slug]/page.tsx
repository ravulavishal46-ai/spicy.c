import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FoodDetail } from "@/components/shop/food-detail";
import { dishes, getDish } from "@/lib/data/menu";

export function generateStaticParams() {
  return dishes.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dish = getDish(slug);
  return { title: dish?.name ?? "Dish", description: dish?.short };
}

export default async function FoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dish = getDish(slug);
  if (!dish) notFound();
  return <FoodDetail dish={dish} />;
}
