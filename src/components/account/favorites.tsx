"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { FoodCard } from "@/components/shop/food-card";
import { getDish } from "@/lib/data/menu";
import { addDishToCart, canOrder, requestEmailSignIn, toast, useFavorites } from "@/lib/store";
import { pluralize } from "@/lib/utils";
import { AccountHeading } from "./account-shell";

export function Favorites() {
  const ids = useFavorites();
  const dishes = ids.map((id) => getDish(id)).filter((d) => d !== undefined);
  return (
    <>
      <AccountHeading eyebrow={pluralize(dishes.length, "saved dish", "saved dishes")} title="Favorites">
        {dishes.length > 1 && (
          <Button
            variant="dark"
            onClick={() => {
              if (!canOrder()) return requestEmailSignIn("add your favorites to the bag");
              dishes.forEach((d) => addDishToCart({ dishId: d.id, silent: true }));
              toast({ title: `Added ${dishes.length} favorites to your bag`, tone: "success" });
            }}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden /> Add all to bag
          </Button>
        )}
      </AccountHeading>
      {dishes.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-9 w-9" />}
          title="No favorites yet"
          body="Tap the heart on any dish to save it here for quick reordering."
          action={<ButtonLink href="/menu">Explore the menu</ButtonLink>}
        />
      ) : (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {dishes.map((d) => (
            <FoodCard key={d.id} dish={d} />
          ))}
        </div>
      )}
    </>
  );
}
