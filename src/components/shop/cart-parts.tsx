"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Tag, Trash2, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { QuantityStepper } from "@/components/ui/misc";
import { getDish } from "@/lib/data/menu";
import { spiceInfo } from "@/lib/data/spice";
import { FREE_DELIVERY_OVER, lineUnitPrice, type Totals } from "@/lib/pricing";
import {
  addDishToCart,
  applyCoupon,
  closeCart,
  removeCoupon,
  removeLine,
  setLineQty,
  useCart,
  useCouponCode,
} from "@/lib/store";
import type { CartLine } from "@/lib/types";
import { cn, money } from "@/lib/utils";

export function describeLine(line: CartLine) {
  if (line.kind === "combo") {
    return {
      title: "Build-Your-Combo",
      image: getDish(line.picks[0].dishId)?.image ?? "",
      detail: line.picks.map((p) => getDish(p.dishId)?.name).join(" + "),
      meta: `${line.discountPct}% combo saving`,
    };
  }
  const dish = getDish(line.dishId);
  const size = dish?.sizes.find((s) => s.id === line.sizeId);
  const addOns = dish?.addOns.filter((a) => line.addOnIds.includes(a.id)).map((a) => a.name) ?? [];
  return {
    title: dish?.name ?? "Unavailable item",
    image: dish?.image ?? "",
    detail: [`${spiceInfo(line.spice).name} heat`, size && dish && dish.sizes.length > 1 ? size.name : null, ...addOns]
      .filter(Boolean)
      .join(" · "),
    meta: line.note ? `Note: “${line.note}”` : "",
  };
}

export function CartLineItem({ line, compact, dark }: { line: CartLine; compact?: boolean; dark?: boolean }) {
  const d = describeLine(line);
  const unit = lineUnitPrice(line);
  const href = line.kind === "dish" ? `/food/${getDish(line.dishId)?.slug}` : "/combo";
  return (
    <li className="flex gap-4 py-4">
      <Link href={href} onClick={closeCart} className="shrink-0 overflow-hidden rounded-2xl">
        <FoodImage src={d.image} alt="" label={d.title} className={compact ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28"} sizes="120px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} onClick={closeCart} className="font-display text-lg font-semibold leading-tight hover:underline">
              {d.title}
            </Link>
            <p className={cn("mt-0.5 text-sm", dark ? "text-cream/65" : "text-ash")}>{d.detail}</p>
            {d.meta && <p className={cn("text-xs", dark ? "text-saffron" : "text-chili-deep")}>{d.meta}</p>}
          </div>
          <p className="shrink-0 font-semibold">{money(unit * line.qty)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            dark={dark}
            label={d.title}
            value={line.qty}
            onChange={(n) => setLineQty(line.key, n)}
          />
          <button
            type="button"
            onClick={() => removeLine(line.key)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm",
              dark ? "text-cream/60 hover:bg-white/10 hover:text-cream" : "text-ash hover:bg-charcoal/5 hover:text-chili-deep",
            )}
            aria-label={`Remove ${d.title} from cart`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export function FreeDeliveryBar({ totals, dark }: { totals: Totals; dark?: boolean }) {
  const pct = Math.min(100, (totals.subtotal / FREE_DELIVERY_OVER) * 100);
  const done = totals.toFreeDelivery === 0;
  return (
    <div className={cn("rounded-2xl p-4", dark ? "bg-white/[0.06]" : "bg-saffron-soft")}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4 shrink-0" aria-hidden />
        {done ? (
          <span>You&apos;ve unlocked free delivery!</span>
        ) : (
          <span>
            Add <strong>{money(totals.toFreeDelivery)}</strong> more for free delivery
          </span>
        )}
      </p>
      <div
        className={cn("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-white")}
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]", done ? "bg-leaf" : "bg-chili")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CouponForm({ dark }: { dark?: boolean }) {
  const code = useCouponCode();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (code) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-2xl border-[1.5px] border-dashed px-4 py-3",
          dark ? "border-saffron/50" : "border-leaf/50 bg-leaf-soft",
        )}
      >
        <p className="flex items-center gap-2 text-sm">
          <Tag className={cn("h-4 w-4", dark ? "text-saffron" : "text-leaf")} aria-hidden />
          <span className="font-mono font-semibold">{code}</span> applied
        </p>
        <button
          type="button"
          onClick={removeCoupon}
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-charcoal/10"
          aria-label={`Remove coupon ${code}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const err = applyCoupon(value);
        setError(err);
        if (!err) setValue("");
      }}
    >
      <label htmlFor={dark ? "coupon-drawer" : "coupon-page"} className="sr-only">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id={dark ? "coupon-drawer" : "coupon-page"}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="Coupon code, e.g. HEAT20"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "coupon-error" : undefined}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-full border-[1.5px] px-4 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case focus:outline-none focus:ring-4 focus:ring-saffron/40",
            dark
              ? "border-white/15 bg-white/[0.06] text-cream placeholder:text-cream/45"
              : "border-cream-300 bg-white placeholder:text-ash/70",
            error && "border-chili",
          )}
        />
        <Button type="submit" variant={dark ? "saffron" : "dark"}>
          Apply
        </Button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className={cn("mt-2 text-sm", dark ? "text-[#ff9b87]" : "text-chili-deep")}>
          {error}
        </p>
      )}
      <Link
        href="/offers"
        onClick={closeCart}
        className={cn("mt-2 inline-block text-xs underline-offset-2 hover:underline", dark ? "text-cream/60" : "text-ash")}
      >
        See all offers
      </Link>
    </form>
  );
}

export function SummaryRows({ totals, dark }: { totals: Totals; dark?: boolean }) {
  const muted = dark ? "text-cream/65" : "text-ash";
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className={muted}>Subtotal</dt>
        <dd className="font-medium">{money(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between">
          <dt className={muted}>Discount</dt>
          <dd className={cn("font-medium", dark ? "text-[#7bd88f]" : "text-leaf")}>−{money(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className={muted}>Delivery</dt>
        <dd className="font-medium">{totals.delivery === 0 ? "Free" : money(totals.delivery)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className={muted}>Taxes (5%)</dt>
        <dd className="font-medium">{money(totals.tax)}</dd>
      </div>
      <div className={cn("flex items-baseline justify-between border-t pt-3", dark ? "border-white/10" : "border-cream-300")}>
        <dt className="font-semibold">Total</dt>
        <dd className="font-display text-2xl font-semibold">{money(totals.total)}</dd>
      </div>
      {totals.couponError && (
        <p className={cn("text-xs", dark ? "text-[#ff9b87]" : "text-chili-deep")}>Coupon not applied: {totals.couponError}</p>
      )}
    </dl>
  );
}

/** "Pairs well with" suggestions — drinks and sides not already in the cart. */
export function CartSuggestions({ dark }: { dark?: boolean }) {
  const lines = useCart();
  const inCart = new Set(lines.flatMap((l) => (l.kind === "dish" ? [l.dishId] : l.picks.map((p) => p.dishId))));
  const picks = ["mango-lassi", "masala-loaded-fries", "chili-chocolate-lava-cake", "spiced-watermelon-cooler", "chili-cheese-samosas"]
    .filter((id) => !inCart.has(id))
    .slice(0, 3)
    .map((id) => getDish(id)!)
    .filter(Boolean);
  if (!picks.length) return null;
  return (
    <div>
      <p className={cn("eyebrow mb-3", dark ? "text-cream/60" : "text-ash")}>Pairs well with</p>
      <ul className="grid grid-cols-3 gap-2">
        {picks.map((dish) => (
          <li key={dish.id}>
            <button
              type="button"
              onClick={() => addDishToCart({ dishId: dish.id })}
              className={cn(
                "group/s w-full cursor-pointer rounded-2xl p-2 text-left transition-colors",
                dark ? "bg-white/[0.06] hover:bg-white/[0.12]" : "bg-white hover:bg-cream-200",
              )}
              aria-label={`Add ${dish.name}, ${money(dish.price)}`}
            >
              <div className="relative">
                <FoodImage src={dish.image} alt="" label={dish.name} className="aspect-square w-full rounded-xl" sizes="120px" />
                <span className="absolute bottom-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-chili text-white transition-transform group-hover/s:scale-110">
                  <Plus className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-semibold">{dish.name}</p>
              <p className={cn("text-xs", dark ? "text-cream/60" : "text-ash")}>{money(dish.price)}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
