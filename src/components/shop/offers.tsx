"use client";

import { useState } from "react";
import { Check, Copy, Percent, Tag, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { coupons } from "@/lib/data/coupons";
import { applyCoupon, toast, useCart, useCouponCode } from "@/lib/store";
import type { Coupon } from "@/lib/types";
import { cn, formatDate, money } from "@/lib/utils";

export function OffersGrid() {
  const applied = useCouponCode();
  const lines = useCart();
  const sorted = [...coupons].sort((a, b) => Number(b.active) - Number(a.active));
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {sorted.map((c, i) => (
        <li key={c.code} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <CouponTicket coupon={c} applied={applied === c.code} cartEmpty={lines.length === 0} />
        </li>
      ))}
    </ul>
  );
}

function CouponTicket({ coupon, applied, cartEmpty }: { coupon: Coupon; applied: boolean; cartEmpty: boolean }) {
  const [copied, setCopied] = useState(false);
  const Icon = coupon.kind === "free-delivery" ? Truck : coupon.kind === "percent" ? Percent : Tag;
  const headline =
    coupon.kind === "percent" ? `${coupon.value}% off` : coupon.kind === "flat" ? `${money(coupon.value)} off` : "Free delivery";

  async function copy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast({ title: `Copied ${coupon.code}` });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Couldn't copy — select the code instead", tone: "error" });
    }
  }

  return (
    <article
      className={cn(
        "relative flex overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-soft)]",
        coupon.active ? "bg-white" : "bg-cream-200 opacity-70",
      )}
      aria-label={`${coupon.code}: ${coupon.title}${coupon.active ? "" : " (expired)"}`}
    >
      <div className={cn("dark-surface flex w-28 shrink-0 flex-col items-center justify-center gap-2 p-4 text-center sm:w-36", coupon.active ? "bg-charcoal text-cream" : "bg-charcoal-600 text-cream/80")}>
        <Icon className="h-6 w-6 text-saffron" aria-hidden />
        <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">{headline}</p>
      </div>
      {/* perforation */}
      <div aria-hidden className="relative w-0">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-cream" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-cream" />
        <span className="absolute inset-y-4 left-0 border-l-2 border-dashed border-cream-300" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold">{coupon.title}</p>
            <p className="mt-1 text-sm text-ash">{coupon.description}</p>
          </div>
          {!coupon.active && <span className="rounded-full bg-charcoal px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-cream">Expired</span>}
        </div>
        <p className="mt-3 text-xs text-ash">
          {coupon.active ? `Valid until ${formatDate(coupon.expires)}` : `Ended ${formatDate(coupon.expires)}`} · used {coupon.uses.toLocaleString("en-IN")} times
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <button
            type="button"
            onClick={copy}
            disabled={!coupon.active}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-dashed border-charcoal/30 px-3.5 py-1.5 font-mono text-sm font-semibold tracking-wider transition-colors hover:border-charcoal disabled:cursor-not-allowed"
            aria-label={`Copy code ${coupon.code}`}
          >
            {coupon.code}
            {copied ? <Check className="h-3.5 w-3.5 text-leaf" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          </button>
          {coupon.active &&
            (applied ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                <Check className="h-4 w-4" aria-hidden /> Applied to your bag
              </span>
            ) : cartEmpty ? (
              <ButtonLink href="/menu" variant="ghost" size="sm">
                Start an order
              </ButtonLink>
            ) : (
              <Button
                size="sm"
                variant="dark"
                onClick={() => {
                  const err = applyCoupon(coupon.code);
                  if (err) toast({ title: "Can't apply yet", description: err, tone: "error" });
                }}
              >
                Apply to bag
              </Button>
            ))}
        </div>
      </div>
    </article>
  );
}
