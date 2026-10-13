import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/misc";
import { MenuBrowser } from "@/components/shop/menu-browser";
import { MenuSkeleton } from "@/components/shop/menu-skeleton";
import { dishes } from "@/lib/data/menu";

export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  return (
    <>
      <PageHeader
        eyebrow={`The menu · ${dishes.length} dishes`}
        title={
          <>
            Everything on <span className="italic text-chili">the flame.</span>
          </>
        }
        body="Search, filter by heat or diet, and tune every dish to your exact spice level."
      />
      <Suspense fallback={<MenuSkeleton />}>
        <MenuBrowser />
      </Suspense>
    </>
  );
}
