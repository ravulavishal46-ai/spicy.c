import Link from "next/link";
import { ChevronRight, Clock, Flame, Leaf, Wheat } from "lucide-react";
import { FoodImage } from "@/components/ui/food-image";
import { Badge, Rating, Stars } from "@/components/ui/misc";
import { DishCustomizer } from "@/components/shop/dish-customizer";
import { FavoriteButton, FoodCard } from "@/components/shop/food-card";
import { demoReviews } from "@/lib/data/account";
import { dishes, getCategory } from "@/lib/data/menu";
import type { Dish } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const dietLabel = { veg: "Vegetarian", vegan: "Vegan", "gluten-free": "Gluten-free", "contains-nuts": "Contains nuts" } as const;

/** Food details page body (shared by the Next.js route and the preview build). */
export function FoodDetail({ dish }: { dish: Dish }) {
  const category = getCategory(dish.category);
  const reviews = demoReviews.filter((r) => r.dishId === dish.id && r.status === "published");
  const related = dishes
    .filter((d) => d.id !== dish.id && (d.category === dish.category || d.profile.some((p) => dish.profile.includes(p))))
    .slice(0, 4);

  return (
    <>
      <div className="container-x pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-ash">
            <li>
              <Link href="/menu" className="hover:text-charcoal">Menu</Link>
            </li>
            <li aria-hidden><ChevronRight className="h-4 w-4" /></li>
            <li>
              <Link href={`/menu/${dish.category}`} className="hover:text-charcoal">{category?.name}</Link>
            </li>
            <li aria-hidden><ChevronRight className="h-4 w-4" /></li>
            <li aria-current="page" className="font-medium text-charcoal">{dish.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container-x grid gap-10 pb-16 pt-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-[2rem] rounded-bl-[6rem]">
            <FoodImage src={dish.image} alt={`${dish.name}: ${dish.short}`} priority className="aspect-[4/4.2] w-full" sizes="(min-width: 1024px) 50vw, 100vw" />
            <FavoriteButton dish={dish} className="absolute right-4 top-4 h-12 w-12" />
            {dish.badges[0] && (
              <span className="absolute left-4 top-4 rounded-full bg-cream px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
                {dish.badges[0].replace("-", " ")}
              </span>
            )}
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: Clock, label: "Ready in", value: `${dish.prepMinutes} min` },
              { icon: Flame, label: "Energy", value: `${dish.calories} kcal` },
              { icon: Wheat, label: "Serves", value: dish.category === "coolers" ? "1 glass" : "1 person" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
                <s.icon className="h-4 w-4 text-chili" aria-hidden />
                <dt className="mt-2 text-xs text-ash">{s.label}</dt>
                <dd className="font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="eyebrow text-chili-deep">{category?.name}</p>
          <h1 className="mt-2 text-5xl font-medium leading-[0.95] sm:text-6xl">{dish.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Rating value={dish.rating} count={dish.reviewCount} size="md" />
            {dish.diet.map((d) => (
              <Badge key={d} tone={d === "contains-nuts" ? "saffron" : "leaf"}>
                {d !== "contains-nuts" && <Leaf className="h-3 w-3" aria-hidden />}
                {dietLabel[d]}
              </Badge>
            ))}
          </div>
          <p className="mt-6 text-lg leading-relaxed text-charcoal/80">{dish.story}</p>
          <p className="mt-4 text-sm text-ash">
            <span className="font-semibold text-charcoal">Ingredients: </span>
            {dish.ingredients.join(", ")}
          </p>
          <div className="my-8 h-px bg-charcoal/10" />
          <DishCustomizer dish={dish} />
        </div>
      </section>

      <section aria-labelledby="dish-reviews" className="container-x border-t border-charcoal/10 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="dish-reviews" className="text-4xl font-medium">What people say</h2>
          <Link href="/support#reviews" className="font-semibold hover:text-chili-deep">Write a review →</Link>
        </div>
        {reviews.length ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  <span className="text-xs text-ash">{formatDate(r.date)}</span>
                </div>
                <p className="mt-3 font-display text-xl font-semibold">{r.title}</p>
                <p className="mt-1 text-ash">{r.body}</p>
                <p className="mt-4 text-sm font-semibold">{r.author}</p>
                {r.reply && (
                  <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm">
                    <span className="font-semibold text-chili-deep">SPICY replied: </span>
                    {r.reply}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-[1.5rem] border-[1.5px] border-dashed border-charcoal/15 px-6 py-10 text-center text-ash">
            No written reviews yet for this dish — {dish.reviewCount.toLocaleString("en-IN")} star ratings averaging {dish.rating}.
          </p>
        )}
      </section>

      <section aria-labelledby="related" className="container-x pb-8 pt-4">
        <h2 id="related" className="text-4xl font-medium">You might also crave</h2>
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((d) => (
            <FoodCard key={d.id} dish={d} />
          ))}
        </div>
      </section>
    </>
  );
}
