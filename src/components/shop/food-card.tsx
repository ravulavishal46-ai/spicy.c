"use client";

import Link from "next/link";
import { Heart, Leaf, Plus } from "lucide-react";
import { FoodImage } from "@/components/ui/food-image";
import { Rating } from "@/components/ui/misc";
import { addDishToCart, toggleFavorite, useFavorites } from "@/lib/store";
import type { Badge as BadgeType, Dish } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { SpiceDots } from "./spice-meter";

const badgeLabel: Record<BadgeType, string> = {
  bestseller: "Bestseller",
  new: "New",
  "chef-pick": "Chef's pick",
  limited: "Limited",
};

export function FavoriteButton({ dish, className, dark }: { dish: Dish; className?: string; dark?: boolean }) {
  const favorites = useFavorites();
  const active = favorites.includes(dish.id);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${dish.name} from favorites` : `Save ${dish.name} to favorites`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(dish.id);
      }}
      className={cn(
        "grid h-10 w-10 cursor-pointer place-items-center rounded-full backdrop-blur transition-[transform,background-color] active:scale-90",
        dark ? "bg-white/10 hover:bg-white/20" : "bg-cream/90 hover:bg-white",
        className,
      )}
    >
      <Heart
        key={active ? "on" : "off"}
        className={cn("h-[18px] w-[18px]", active ? "animate-pop fill-chili text-chili" : dark ? "text-cream" : "text-charcoal")}
      />
    </button>
  );
}

export function FoodCard({ dish, priority, className }: { dish: Dish; priority?: boolean; className?: string }) {
  const badge = dish.badges[0];
  const isVeg = dish.diet.includes("veg");
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link
        href={`/food/${dish.slug}`}
        className="relative block overflow-hidden rounded-[var(--radius-card)] focus-visible:outline-offset-4"
      >
        <FoodImage
          src={dish.image}
          alt={dish.name}
          priority={priority}
          className="aspect-[4/3] w-full [&_img]:group-hover:scale-[1.06]"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 480px) 50vw, 100vw"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-cream px-3 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-charcoal">
            {badgeLabel[badge]}
          </span>
        )}
        <span className="sr-only">View {dish.name}</span>
      </Link>
      <FavoriteButton dish={dish} className="absolute right-3 top-3" />

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-3">
          <SpiceDots level={dish.spice} />
          <Rating value={dish.rating} />
        </div>
        <h3 className="mt-2 text-[1.35rem] font-semibold leading-tight">
          <Link href={`/food/${dish.slug}`} className="hover:text-chili-deep">
            {dish.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ash">{dish.short}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold">{money(dish.price)}</span>
            {isVeg && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-leaf">
                <Leaf className="h-3.5 w-3.5" aria-hidden /> Veg
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => addDishToCart({ dishId: dish.id })}
            aria-label={`Quick add ${dish.name} to cart`}
            className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-charcoal pl-3.5 pr-4 text-sm font-semibold text-cream transition-[background-color,transform] hover:bg-chili-deep active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export function FoodCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      <div className="skeleton aspect-[4/3] w-full rounded-[var(--radius-card)]" />
      <div className="skeleton mt-4 h-4 w-24" />
      <div className="skeleton mt-3 h-6 w-3/4" />
      <div className="skeleton mt-2 h-4 w-full" />
      <div className="mt-5 flex justify-between">
        <div className="skeleton h-7 w-20" />
        <div className="skeleton h-11 w-20 rounded-full" />
      </div>
    </div>
  );
}
