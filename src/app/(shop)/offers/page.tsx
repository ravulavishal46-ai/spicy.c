import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { OffersGrid } from "@/components/shop/offers";
import { COMBO_DISCOUNT, FREE_DELIVERY_OVER } from "@/lib/pricing";
import { money } from "@/lib/utils";

export const metadata: Metadata = { title: "Offers & coupons" };

export default function OffersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Offers & coupons"
        title={
          <>
            Turn up the taste, <span className="italic text-chili">turn down the bill.</span>
          </>
        }
        body="Copy a code or apply it straight to your bag. One coupon per order. All offers are part of this demo."
      />
      <div className="container-x">
        <OffersGrid />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-saffron p-8">
            <p className="eyebrow text-charcoal/70">Always on</p>
            <p className="mt-2 font-display text-3xl font-semibold">{COMBO_DISCOUNT}% off every combo</p>
            <p className="mt-2 text-charcoal/75">Main + side + cooler, bundled automatically. Stacks with coupons.</p>
            <ButtonLink href="/combo" variant="dark" className="mt-6">Build a combo</ButtonLink>
          </div>
          <div className="dark-surface rounded-[1.75rem] bg-charcoal p-8 text-cream">
            <p className="eyebrow text-saffron">Always on</p>
            <p className="mt-2 font-display text-3xl font-semibold">Free delivery over {money(FREE_DELIVERY_OVER)}</p>
            <p className="mt-2 text-cream/70">No code needed — it&apos;s applied at checkout automatically.</p>
            <ButtonLink href="/menu" variant="saffron" className="mt-6">Start an order</ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
