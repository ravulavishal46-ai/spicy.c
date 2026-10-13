"use client";

import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { SectionHeading, Skeleton } from "@/components/ui/misc";
import { FoodCard } from "@/components/shop/food-card";
import { spiceInfo } from "@/lib/data/spice";
import { frequentItems, popular, recommend, tagLabels } from "@/lib/discovery";
import { addDishToCart, reorder, useFavorites, useOrders, useUser } from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import { formatDate, money } from "@/lib/utils";

/** Smart Reorder: your most-ordered dishes, re-added with your usual heat in one tap. */
export function SmartReorder({ heading = true }: { heading?: boolean }) {
  const orders = useOrders();
  const items = frequentItems(orders, 3);
  const last = orders.find((o) => o.status === "delivered");
  if (!items.length) return null;
  return (
    <div>
      {heading && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2 text-chili-deep">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Smart reorder
            </p>
            <h3 className="mt-2 text-3xl font-semibold">Your usuals, one tap away</h3>
          </div>
          {last && (
            <Button variant="outline" size="sm" onClick={() => reorder(last)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Repeat last order ({money(last.total)})
            </Button>
          )}
        </div>
      )}
      <ul className="grid gap-3 md:grid-cols-3">
        {items.map(({ dish, times, spice, lastOrdered }) => (
          <li key={dish.id} className="flex min-w-0 items-center gap-4 rounded-[1.25rem] bg-white p-3 pr-4 shadow-[var(--shadow-soft)]">
            <Link href={`/food/${dish.slug}`} className="shrink-0 overflow-hidden rounded-2xl">
              <FoodImage src={dish.image} alt="" label={dish.name} className="h-20 w-20" sizes="80px" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/food/${dish.slug}`} className="block truncate font-display text-lg font-semibold hover:text-chili-deep">
                {dish.name}
              </Link>
              <p className="text-xs text-ash">
                Ordered {times}× · last {formatDate(lastOrdered)}
              </p>
              <p className="text-xs font-medium text-chili-deep">Your heat: {spiceInfo(spice).name}</p>
            </div>
            <Button
              size="icon-sm"
              variant="dark"
              onClick={() => addDishToCart({ dishId: dish.id, spice })}
              aria-label={`Reorder ${dish.name} at ${spiceInfo(spice).name} heat`}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Personalised discovery layout on the landing page. */
export function ForYou() {
  const hydrated = useHydrated();
  const user = useUser();
  const favorites = useFavorites();
  const orders = useOrders();

  if (!hydrated) {
    return (
      <section className="container-x py-16" aria-hidden>
        <Skeleton className="h-10 w-72" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section aria-labelledby="foryou-title" className="container-x py-16 sm:py-20">
        <SectionHeading
          eyebrow="Popular right now"
          title={<span id="foryou-title">What everyone&apos;s ordering tonight.</span>}
          body="Sign in to get a feed tuned to your favourite flavours and heat level, plus one-tap reorders."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/login" variant="dark">
            <Sparkles className="h-4 w-4" aria-hidden /> Personalise my menu
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {popular(4).map((d) => (
            <FoodCard key={d.id} dish={d} />
          ))}
        </div>
      </section>
    );
  }

  const { dishes: picks, topTag } = recommend(favorites, orders, user.heatPreference, 4);
  return (
    <section aria-labelledby="foryou-title" className="container-x py-16 sm:py-20">
      <div className="rounded-[2rem] bg-cream-200/70 p-5 sm:p-8 lg:p-10">
        <SmartReorder />
      </div>
      <SectionHeading
        className="mt-16"
        eyebrow={`For you, ${user.name.split(" ")[0]}`}
        title={
          <span id="foryou-title">
            Because you love <span className="italic text-chili">{topTag ? tagLabels[topTag] ?? topTag : "big flavour"}</span>.
          </span>
        }
        body={`Tuned to your ${spiceInfo(user.heatPreference).name.toLowerCase()} heat preference and your favorites.`}
        action={{ href: "/account", label: "Change heat preference" }}
      />
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {picks.map((d) => (
          <FoodCard key={d.id} dish={d} />
        ))}
      </div>
    </section>
  );
}
