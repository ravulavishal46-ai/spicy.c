"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { QuantityStepper } from "@/components/ui/misc";
import { dishLineUnitPrice } from "@/lib/pricing";
import { addDishToCart, openCart } from "@/lib/store";
import type { Dish, SpiceLevel } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { SpiceMeter } from "./spice-meter";

const NOTE_LIMIT = 120;

/** Food customization: spice, size, add-ons, kitchen note and quantity with a live price. */
export function DishCustomizer({ dish }: { dish: Dish }) {
  const [spice, setSpice] = useState<SpiceLevel>(dish.spice);
  const [sizeId, setSizeId] = useState<string | null>(dish.sizes[0]?.id ?? null);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const unit = dishLineUnitPrice({ dishId: dish.id, addOnIds, sizeId });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (note.length > NOTE_LIMIT) {
      setNoteError(`Keep kitchen notes under ${NOTE_LIMIT} characters.`);
      return;
    }
    if (/<|>/.test(note)) {
      setNoteError("Please avoid < and > characters in notes.");
      return;
    }
    if (!addDishToCart({ dishId: dish.id, qty, spice, addOnIds, sizeId, note: note.trim() })) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <SpiceMeter value={spice} onChange={setSpice} houseLevel={dish.spice} locked={!dish.spiceAdjustable} />

      {dish.sizes.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-ash">Size</legend>
          <div className="grid grid-cols-2 gap-3">
            {dish.sizes.map((s) => (
              <label
                key={s.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-2xl border-[1.5px] bg-white px-4 py-3.5 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-saffron/50",
                  sizeId === s.id ? "border-charcoal" : "border-cream-300 hover:border-charcoal/40",
                )}
              >
                <input
                  type="radio"
                  name="size"
                  value={s.id}
                  checked={sizeId === s.id}
                  onChange={() => setSizeId(s.id)}
                  className="sr-only"
                />
                <span className="font-semibold">{s.name}</span>
                <span className="text-sm text-ash">{s.priceDelta ? `+${money(s.priceDelta)}` : "Included"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {dish.addOns.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-ash">Make it yours</legend>
          <div className="space-y-2">
            {dish.addOns.map((a) => {
              const checked = addOnIds.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] bg-white px-4 py-3 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-saffron/50",
                    checked ? "border-charcoal" : "border-cream-300 hover:border-charcoal/40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setAddOnIds((ids) => (checked ? ids.filter((i) => i !== a.id) : [...ids, a.id]))}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-md border-[1.5px] transition-colors",
                      checked ? "border-chili bg-chili text-white" : "border-charcoal/30",
                    )}
                  >
                    {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 font-medium">{a.name}</span>
                  <span className="text-sm text-ash">+{money(a.price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <Field
        label="Note for the kitchen"
        optional
        error={noteError}
        hint={`${note.length}/${NOTE_LIMIT} · e.g. "no coriander", "sauce on the side"`}
      >
        {(p) => (
          <Textarea
            {...p}
            value={note}
            rows={2}
            onChange={(e) => {
              setNote(e.target.value);
              if (noteError) setNoteError(null);
            }}
            placeholder="Any allergies or preferences?"
            className="min-h-20"
          />
        )}
      </Field>

      <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-full bg-cream/95 p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-charcoal/5 backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0">
        <QuantityStepper label={dish.name} value={qty} min={1} onChange={setQty} />
        <Button type="submit" size="lg" className="flex-1 justify-between px-6">
          <span className="inline-flex items-center gap-2">
            {justAdded ? <Check className="h-5 w-5 animate-pop" aria-hidden /> : <ShoppingBag className="h-5 w-5" aria-hidden />}
            {justAdded ? "Added!" : "Add to bag"}
          </span>
          <span className="font-display text-xl">{money(unit * qty)}</span>
        </Button>
      </div>
      {justAdded && (
        <button type="button" onClick={openCart} className="-mt-4 cursor-pointer text-sm font-semibold text-chili-deep underline-offset-2 hover:underline">
          View bag →
        </button>
      )}
    </form>
  );
}
