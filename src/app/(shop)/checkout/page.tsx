import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { Checkout } from "@/components/shop/checkout";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Let's get it to you." />
      <Checkout />
    </>
  );
}
