"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/misc";
import { cartDrawerStore, closeCart, useCart, useCartTotals } from "@/lib/store";
import { money, pluralize } from "@/lib/utils";
import { CartLineItem, CartSuggestions, CouponForm, FreeDeliveryBar } from "./cart-parts";

export function CartDrawer() {
  const open = cartDrawerStore.useStore();
  const lines = useCart();
  const totals = useCartTotals();
  const router = useRouter();

  return (
    <Drawer
      open={open}
      onClose={closeCart}
      dark
      title={lines.length ? `Your bag · ${pluralize(totals.itemCount, "item")}` : "Your bag"}
      footer={
        lines.length ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-cream/70">Estimated total</span>
              <span className="font-display text-3xl font-semibold">{money(totals.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/cart" variant="outline" className="border-white/30 text-cream hover:bg-white hover:text-charcoal" onClick={closeCart}>
                View bag
              </ButtonLink>
              <Button
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
              >
                Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-9 w-9" />}
          title="Your bag is empty"
          body="Nothing's on the flame yet. Find something that makes you sweat a little."
          className="text-cream [&_p]:text-cream/65"
          action={
            <ButtonLink href="/menu" variant="saffron" onClick={closeCart}>
              Browse the menu
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-6 px-6 py-5">
          <FreeDeliveryBar totals={totals} dark />
          <ul className="divide-y divide-white/10">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} compact dark />
            ))}
          </ul>
          <CouponForm dark />
          <CartSuggestions dark />
        </div>
      )}
    </Drawer>
  );
}
