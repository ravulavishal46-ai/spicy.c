"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchX, SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Checkbox, Select } from "@/components/ui/field";
import { EmptyState, ErrorState } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/reveal";
import { FoodCard } from "@/components/shop/food-card";
import { ChiliIcon } from "@/components/ui/brand";
import { categories, dishes } from "@/lib/data/menu";
import { spiceLevels } from "@/lib/data/spice";
import type { DietTag, Dish } from "@/lib/types";
import { cn, pluralize } from "@/lib/utils";

const sorts = {
  featured: "Featured",
  popular: "Most popular",
  rating: "Top rated",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "heat-desc": "Hottest first",
  "heat-asc": "Mildest first",
} as const;
type SortKey = keyof typeof sorts;

const dietOptions: { id: DietTag; label: string }[] = [
  { id: "veg", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
];

function sortDishes(list: Dish[], sort: SortKey) {
  const copy = [...list];
  switch (sort) {
    case "popular":
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "heat-desc":
      return copy.sort((a, b) => b.spice - a.spice);
    case "heat-asc":
      return copy.sort((a, b) => a.spice - b.spice);
    default:
      return copy;
  }
}

export function MenuBrowser({ lockedCategory }: { lockedCategory?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get("q") ?? "";
  const [query, setQuery] = useState(q);
  // Keep the input in sync when the URL changes from elsewhere (e.g. header search).
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q);
  }
  const category = lockedCategory ?? params.get("category") ?? "all";
  const diet = (params.get("diet")?.split(",").filter(Boolean) ?? []) as DietTag[];
  const heat = Number(params.get("heat")) || 0;
  const maxPrice = Number(params.get("max")) || 0;
  const sort = (params.get("sort") as SortKey) in sorts ? (params.get("sort") as SortKey) : "featured";
  const simulateError = params.get("simulate") === "error";

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || v === "all" || v === "0") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearAll() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  const results = (() => {
    const term = q.trim().toLowerCase();
    const filtered = dishes.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (diet.length && !diet.every((t) => d.diet.includes(t))) return false;
      if (heat && d.spice !== heat) return false;
      if (maxPrice && d.price > maxPrice) return false;
      if (term) {
        const hay = [d.name, d.short, d.category, ...d.ingredients, ...d.profile].join(" ").toLowerCase();
        if (!term.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    return sortDishes(filtered, sort);
  })();

  const activeCount =
    (lockedCategory ? 0 : category !== "all" ? 1 : 0) + diet.length + (heat ? 1 : 0) + (maxPrice ? 1 : 0) + (q ? 1 : 0);
  const grouped = !q && sort === "featured" && !lockedCategory && category === "all";

  const filterPanel = (
    <div className="space-y-8">
      {!lockedCategory && (
        <fieldset>
          <legend className="eyebrow mb-3 text-ash">Category</legend>
          <div className="flex flex-wrap gap-2">
            {[{ slug: "all", name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => update({ category: c.slug })}
                className={cn(
                  "cursor-pointer rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === c.slug
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-charcoal/15 hover:border-charcoal/50",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="eyebrow mb-3 text-ash">Heat level</legend>
        <div className="grid grid-cols-5 gap-1.5" role="group">
          {spiceLevels.map((s) => (
            <button
              key={s.level}
              type="button"
              aria-pressed={heat === s.level}
              aria-label={`${s.name} heat`}
              onClick={() => update({ heat: heat === s.level ? null : String(s.level) })}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-[1.5px] py-2 text-[0.65rem] font-semibold transition-colors",
                heat === s.level ? "border-chili bg-chili-soft text-chili-deep" : "border-charcoal/10 bg-white hover:border-charcoal/40",
              )}
            >
              <span className="flex">
                {Array.from({ length: s.level }).map((_, i) => (
                  <ChiliIcon key={i} className="-mx-[3px] h-3 w-3 text-chili" />
                ))}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3 text-ash">Diet</legend>
        <div className="space-y-3">
          {dietOptions.map((o) => (
            <Checkbox
              key={o.id}
              label={o.label}
              checked={diet.includes(o.id)}
              onChange={(e) => {
                const next = e.target.checked ? [...diet, o.id] : diet.filter((d) => d !== o.id);
                update({ diet: next.join(",") || null });
              }}
            />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3 text-ash">Max price</legend>
        <div className="flex flex-wrap gap-2">
          {[0, 200, 300, 400].map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={maxPrice === p}
              onClick={() => update({ max: String(p) })}
              className={cn(
                "cursor-pointer rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium transition-colors",
                maxPrice === p ? "border-charcoal bg-charcoal text-cream" : "border-charcoal/15 hover:border-charcoal/50",
              )}
            >
              {p === 0 ? "Any" : `Under ₹${p}`}
            </button>
          ))}
        </div>
      </fieldset>
      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="cursor-pointer text-sm font-semibold text-chili-deep underline-offset-2 hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x">
      {/* toolbar */}
      <div className="sticky top-[4.25rem] z-20 -mx-4 border-b border-charcoal/[0.07] bg-cream/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex flex-wrap items-center gap-3">
          <form
            role="search"
            className="relative min-w-0 flex-1 sm:max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: query.trim() || null });
            }}
          >
            <label htmlFor="menu-search" className="sr-only">
              Search the menu
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" aria-hidden />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                update({ q: e.target.value.trim() || null });
              }}
              placeholder="Search dishes, ingredients, cuisines…"
              className="h-12 w-full rounded-full border-[1.5px] border-cream-300 bg-white pl-11 pr-10 text-[0.95rem] placeholder:text-ash/75 focus:border-charcoal focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  update({ q: null });
                }}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full hover:bg-charcoal/5"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filters{activeCount ? ` (${activeCount})` : ""}
          </Button>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label htmlFor="menu-sort" className="whitespace-nowrap text-sm text-ash">
              Sort by
            </label>
            <Select id="menu-sort" value={sort} onChange={(e) => update({ sort: e.target.value })} className="h-11 w-auto rounded-full">
              {Object.entries(sorts).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[260px_1fr] lg:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-40">{filterPanel}</div>
        </aside>

        <div>
          <p className="mb-6 text-sm text-ash" aria-live="polite">
            {simulateError ? "Couldn't load dishes" : `${pluralize(results.length, "dish", "dishes")}${q ? ` matching “${q}”` : ""}`}
          </p>
          {simulateError ? (
            <ErrorState onRetry={() => update({ simulate: null })} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-9 w-9" />}
              title="Nothing on the flame"
              body={q ? `We couldn't find anything for “${q}”. Try another dish, ingredient or cuisine.` : "No dishes match these filters. Try loosening them a little."}
              action={
                <Button variant="dark" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          ) : grouped ? (
            <div className="space-y-20">
              {categories.map((c, ci) => {
                const items = results.filter((d) => d.category === c.slug);
                if (!items.length) return null;
                return (
                  <section key={c.slug} aria-labelledby={`cat-${c.slug}`} id={c.slug} className="scroll-mt-40">
                    <div className="mb-8 flex items-end justify-between gap-4 border-b border-charcoal/10 pb-4">
                      <div>
                        <p className="font-mono text-xs text-chili-deep">{String(ci + 1).padStart(2, "0")} /</p>
                        <h2 id={`cat-${c.slug}`} className="text-4xl font-medium sm:text-5xl">
                          {c.name}
                        </h2>
                        <p className="mt-1 text-ash">{c.tagline}</p>
                      </div>
                      <Link href={`/menu/${c.slug}`} className="hidden shrink-0 text-sm font-semibold hover:text-chili-deep sm:block">
                        View all →
                      </Link>
                    </div>
                    <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                      {items.map((d, i) => (
                        <li key={d.id}>
                          <Reveal delay={(i % 3) * 70}>
                            <FoodCard dish={d} priority={ci === 0 && i < 3} />
                          </Reveal>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((d, i) => (
                <li key={d.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <FoodCard dish={d} priority={i < 3} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <Button className="w-full" variant="dark" onClick={() => setFiltersOpen(false)}>
            Show {pluralize(results.length, "dish", "dishes")}
          </Button>
        }
      >
        <div className="px-6 py-6">{filterPanel}</div>
      </Drawer>
    </div>
  );
}
