import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { FoodImage } from "@/components/ui/food-image";
import { MenuBrowser } from "@/components/shop/menu-browser";
import { MenuSkeleton } from "@/components/shop/menu-skeleton";
import { categories, dishesInCategory, getCategory } from "@/lib/data/menu";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: getCategory(category)?.name ?? "Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const index = categories.findIndex((c) => c.slug === slug);
  const count = dishesInCategory(slug).length;

  return (
    <>
      <header className="container-x pb-10 pt-8">
        <Link href="/menu" className="inline-flex items-center gap-1 text-sm font-semibold text-ash hover:text-charcoal">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Full menu
        </Link>
        <div className="dark-surface relative mt-5 overflow-hidden rounded-[2rem] bg-charcoal text-cream">
          <FoodImage src={category.image} alt="" label={category.name} priority className="absolute inset-0 h-full w-full opacity-60" sizes="100vw" />
          <div className="absolute inset-0 bg-linear-to-r from-charcoal via-charcoal/70 to-transparent" aria-hidden />
          <div className="relative max-w-2xl px-7 py-14 sm:px-12 sm:py-20">
            <p className="eyebrow text-saffron">
              {String(index + 1).padStart(2, "0")} / {count} dishes
            </p>
            <h1 className="mt-3 text-5xl font-medium leading-[0.95] sm:text-7xl">{category.name}</h1>
            <p className="mt-4 text-lg text-cream/80">{category.description}</p>
          </div>
        </div>
        <nav aria-label="Categories" className="scrollbar-none -mx-4 mt-6 overflow-x-auto px-4">
          <ul className="flex gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/menu/${c.slug}`}
                  aria-current={c.slug === slug ? "page" : undefined}
                  className={
                    c.slug === slug
                      ? "inline-block whitespace-nowrap rounded-full bg-chili-strong px-4 py-2 text-sm font-semibold text-white"
                      : "inline-block whitespace-nowrap rounded-full border-[1.5px] border-charcoal/15 px-4 py-2 text-sm font-semibold hover:border-charcoal"
                  }
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <Suspense fallback={<MenuSkeleton />}>
        <MenuBrowser lockedCategory={slug} />
      </Suspense>
    </>
  );
}
