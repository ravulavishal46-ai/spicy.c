"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FoodImage } from "@/components/ui/food-image";
import { SpiceMeter } from "@/components/shop/spice-meter";
import { dishes } from "@/lib/data/menu";
import { spiceInfo } from "@/lib/data/spice";
import type { SpiceLevel } from "@/lib/types";
import { money } from "@/lib/utils";

/** Landing-page showcase for the Interactive Spice Meter: dial a heat, see matching dishes. */
export function HeatExplorer() {
  const [level, setLevel] = useState<SpiceLevel>(3);
  const matches = dishes.filter((d) => d.spice === level && d.category !== "coolers").slice(0, 4);
  const info = spiceInfo(level);
  return (
    <section aria-labelledby="heat-title" className="dark-surface relative overflow-hidden bg-charcoal text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-chili/25 blur-[100px] transition-opacity duration-700"
        style={{ opacity: 0.25 + level * 0.15 }}
      />
      <div className="container-x relative grid gap-12 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow text-saffron">
            <span className="text-cream/50">02 /</span> The Spice Meter
          </p>
          <h2 id="heat-title" className="mt-3 text-5xl font-medium leading-[0.95] sm:text-6xl">
            How hot do you <span className="italic text-saffron">really</span> like it?
          </h2>
          <p className="mt-5 max-w-md text-lg text-cream/70">
            Drag, tap or use your arrow keys. Every dish can be tuned on its own page — here&apos;s what the kitchen
            cooks at <strong className="text-cream">{info.name}</strong> by default.
          </p>
          <SpiceMeter value={level} onChange={setLevel} dark className="mt-8 max-w-md" />
        </div>
        <div>
          <ul className="grid grid-cols-2 gap-4" aria-live="polite" aria-label={`Dishes at ${info.name} heat`}>
            {matches.map((d) => (
              <li key={`${level}-${d.id}`} className="animate-rise">
                <Link href={`/food/${d.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <FoodImage
                      src={d.image}
                      alt=""
                      label={d.name}
                      className="aspect-[4/3] w-full [&_img]:group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <p className="font-display text-lg font-semibold leading-tight group-hover:text-saffron">{d.name}</p>
                    <p className="shrink-0 text-sm text-cream/70">{money(d.price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/menu?heat=${level}`}
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-saffron pb-1 font-semibold hover:text-saffron"
          >
            Everything at {info.name} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
