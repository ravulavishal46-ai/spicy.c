"use client";

import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { useCart, useCartTotals } from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import { pluralize } from "@/lib/utils";
import { CartLineItem, CartSuggestions, CouponForm, FreeDeliveryBar, SummaryRows } from "./cart-parts";
import { SmartReorder } from "./smart-reorder";

export function CartView() {
  const hydrated = useHydrated();
  const lines = useCart();
  const totals = useCartTotals();

  if (!hydrated) {
    return (
      <div className="container-x py-14" role="status" aria-label="Loading your bag">
        <Skeleton className="h-16 w-80" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-x py-10">
        <EmptyState
          icon={<ShoppingBag className="h-9 w-9" />}
          title="Your bag is empty"
          body="Nothing's on the flame yet. Pick a dish, build a combo, or repeat a favourite order."
          action={
            <>
              <ButtonLink href="/menu">Browse the menu</ButtonLink>
              <ButtonLink href="/combo" variant="outline">
                Build a combo
              </ButtonLink>
            </>
          }
        />
        <div className="mx-auto max-w-5xl">
          <SmartReorder />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow={`Your bag · ${pluralize(totals.itemCount, "item")}`} title="Almost there." />
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div>
          <FreeDeliveryBar totals={totals} />
          <ul className="mt-2 divide-y divide-charcoal/10">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} />
            ))}
          </ul>
          <div className="mt-8">
            <CartSuggestions />
          </div>
        </div>
        <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-2xl font-semibold">Summary</h2>
            <CouponForm />
            <SummaryRows totals={totals} />
            <ButtonLink href="/checkout" size="lg" className="w-full">
              Checkout <ArrowRight className="h-5 w-5" aria-hidden />
            </ButtonLink>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ash">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Simulated checkout — no real payment is taken.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
