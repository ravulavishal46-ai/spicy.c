import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { ComboBuilder } from "@/components/shop/combo-builder";
import { COMBO_DISCOUNT } from "@/lib/pricing";

export const metadata: Metadata = { title: "Build Your Combo" };

export default function ComboPage() {
  return (
    <>
      <PageHeader
        eyebrow="Build your combo"
        title={
          <>
            Three picks. <span className="italic text-chili">{COMBO_DISCOUNT}% off.</span>
          </>
        }
        body="Choose a main, a side and a cooler, set the heat on each, and we'll bundle the lot at a combo price."
      />
      <ComboBuilder />
    </>
  );
}
