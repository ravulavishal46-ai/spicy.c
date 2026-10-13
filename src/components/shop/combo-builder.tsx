"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { comboCandidates, getDish } from "@/lib/data/menu";
import { spiceInfo } from "@/lib/data/spice";
import { COMBO_DISCOUNT, comboPrice } from "@/lib/pricing";
import { addComboToCart } from "@/lib/store";
import type { ComboRole, SpiceLevel } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { SpiceDots, SpiceMeter } from "./spice-meter";

const steps: { role: ComboRole; title: string; blurb: string }[] = [
  { role: "main", title: "Pick a main", blurb: "The star of the show." },
  { role: "side", title: "Add a side", blurb: "Something crunchy to share (or not)." },
  { role: "drink", title: "Choose a cooler", blurb: "Your fire extinguisher." },
];

type Pick = { dishId: string; spice: SpiceLevel } | null;

export function ComboBuilder() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Pick[]>([null, null, null]);
  const current = steps[step];
  const options = comboCandidates(current.role);
  const chosen = picks.filter((p): p is NonNullable<Pick> => p !== null);
  const complete = chosen.length === 3;
  const price = comboPrice(chosen);
  const currentPick = picks[step];
  const currentDish = currentPick ? getDish(currentPick.dishId) : null;

  function choose(dishId: string) {
    const dish = getDish(dishId)!;
    setPicks((p) => p.map((x, i) => (i === step ? { dishId, spice: dish.spice } : x)));
  }

  function setSpice(level: SpiceLevel) {
    setPicks((p) => p.map((x, i) => (i === step && x ? { ...x, spice: level } : x)));
  }

  function reset() {
    setPicks([null, null, null]);
    setStep(0);
  }

  return (
    <div className="container-x grid gap-10 pb-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <div>
        {/* stepper */}
        <ol className="grid grid-cols-3 gap-2" aria-label="Combo steps">
          {steps.map((s, i) => {
            const done = picks[i] !== null;
            const active = i === step;
            return (
              <li key={s.role}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border-[1.5px] p-3 text-left transition-colors sm:flex-row sm:items-center sm:p-4",
                    active ? "border-charcoal bg-white" : "border-transparent bg-cream-200/70 hover:bg-cream-200",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-sm font-bold transition-colors",
                      done ? "bg-leaf text-white" : active ? "bg-charcoal text-cream" : "bg-white text-ash",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-ash">{s.role}</span>
                    <span className="block truncate text-sm font-semibold">
                      {picks[i] ? getDish(picks[i]!.dishId)?.name : s.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-chili-deep">Step {step + 1} of 3</p>
            <h2 className="mt-1 text-4xl font-medium">{current.title}</h2>
            <p className="text-ash">{current.blurb}</p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="sr-only">{current.title}</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {options.map((d) => {
              const selected = currentPick?.dishId === d.id;
              return (
                <label
                  key={d.id}
                  className={cn(
                    "group relative cursor-pointer rounded-[1.25rem] bg-white p-2 ring-2 transition-[box-shadow,transform] has-[:focus-visible]:ring-saffron",
                    selected ? "ring-chili" : "ring-transparent hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                  )}
                >
                  <input
                    type="radio"
                    name={`combo-${current.role}`}
                    checked={selected}
                    onChange={() => choose(d.id)}
                    className="sr-only"
                  />
                  <div className="relative overflow-hidden rounded-2xl">
                    <FoodImage src={d.image} alt="" label={d.name} className="aspect-square w-full" sizes="200px" />
                    {selected && (
                      <span className="absolute right-2 top-2 grid h-8 w-8 animate-pop place-items-center rounded-full bg-chili text-white">
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="px-1.5 pb-1.5 pt-3">
                    <p className="line-clamp-1 font-semibold leading-tight">{d.name}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-ash">{money(d.price)}</span>
                      {d.category !== "coolers" && <SpiceDots level={d.spice} />}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {currentPick && currentDish && current.role !== "drink" && (
          <div className="mt-8 animate-rise rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <p className="mb-2 font-semibold">Set the heat for {currentDish.name}</p>
            <SpiceMeter
              value={currentPick.spice}
              onChange={setSpice}
              houseLevel={currentDish.spice}
              locked={!currentDish.spiceAdjustable}
            />
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          {step < 2 && (
            <Button variant="dark" onClick={() => setStep((s) => s + 1)} disabled={!currentPick}>
              Next: {steps[step + 1].role} <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {/* summary */}
      <aside aria-label="Your combo" className="lg:sticky lg:top-24 lg:self-start">
        <div className="dark-surface overflow-hidden rounded-[2rem] bg-charcoal text-cream">
          <div className="p-6">
            <p className="eyebrow text-saffron">Your combo</p>
            <ul className="mt-5 space-y-4">
              {steps.map((s, i) => {
                const pick = picks[i];
                const dish = pick ? getDish(pick.dishId) : null;
                return (
                  <li key={s.role} className="flex items-center gap-3">
                    {dish ? (
                      <FoodImage src={dish.image} alt="" label={dish.name} className="h-14 w-14 shrink-0 rounded-xl" sizes="60px" />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border-[1.5px] border-dashed border-white/20 font-mono text-sm text-cream/50">
                        {i + 1}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wider text-cream/50">{s.role}</p>
                      <p className="truncate font-semibold">{dish ? dish.name : "Not chosen yet"}</p>
                      {dish && pick && s.role !== "drink" && (
                        <p className="text-xs text-saffron">{spiceInfo(pick.spice).name} heat</p>
                      )}
                    </div>
                    {dish && <span className="text-sm text-cream/70">{money(dish.price)}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="border-t border-white/10 bg-white/[0.03] p-6">
            <div className="flex justify-between text-sm text-cream/70">
              <span>Items</span>
              <span className={cn(complete && "line-through")}>{money(price.full)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-cream/70">Combo saving ({COMBO_DISCOUNT}%)</span>
              <span className="text-[#7bd88f]">{complete ? `−${money(price.saved)}` : "—"}</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-semibold">Combo price</span>
              <span className="font-display text-4xl font-semibold">{money(complete ? price.price : price.full)}</span>
            </div>
            <Button
              variant="saffron"
              size="lg"
              className="mt-5 w-full"
              disabled={!complete}
              onClick={() => {
                addComboToCart(chosen);
                reset();
              }}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              {complete ? "Add combo to bag" : `Pick ${3 - chosen.length} more`}
            </Button>
            {chosen.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-sm text-cream/60 hover:text-cream"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
