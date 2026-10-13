import Link from "next/link";
import { ArrowUpRight, Flame, Quote, Timer, Truck } from "lucide-react";
import { ChiliIcon, HeatLine } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { SectionHeading, Stars } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/reveal";
import { FoodCard } from "@/components/shop/food-card";
import { demoReviews } from "@/lib/data/account";
import { photos } from "@/lib/data/images";
import { categories, dishes, dishesInCategory, getDish } from "@/lib/data/menu";
import { COMBO_DISCOUNT } from "@/lib/pricing";

export function CategoryRail() {
  return (
    <section aria-labelledby="cat-title" className="container-x py-16 sm:py-20">
      <SectionHeading
        index="01"
        eyebrow="Explore"
        title={<span id="cat-title">Pick your poison.</span>}
        action={{ href: "/menu", label: "See the full menu" }}
      />
      <ul className="scrollbar-none -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {categories.slice(0, 5).map((c, i) => (
          <li key={c.slug} className="w-[68vw] shrink-0 snap-start sm:w-[40vw] lg:w-auto">
            <Reveal delay={i * 70}>
              <Link href={`/menu/${c.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-[var(--radius-card)]">
                  <FoodImage
                    src={c.image}
                    alt=""
                    label={c.name}
                    className="aspect-[4/5] w-full [&_img]:group-hover:scale-[1.07]"
                    sizes="(min-width: 1024px) 20vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal/85 via-charcoal/10 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                    <p className="font-mono text-xs text-saffron">
                      {String(i + 1).padStart(2, "0")} · {dishesInCategory(c.slug).length} dishes
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold leading-tight">{c.name}</p>
                  </div>
                  <span className="absolute right-4 top-4 grid h-10 w-10 -translate-y-2 place-items-center rounded-full bg-cream text-charcoal opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ArrowUpRight className="h-5 w-5" aria-hidden />
                  </span>
                </div>
                <p className="mt-3 text-sm text-ash">{c.tagline}</p>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.slice(5).map((c) => (
          <Link
            key={c.slug}
            href={`/menu/${c.slug}`}
            className="rounded-full border-[1.5px] border-charcoal/15 px-4 py-2 text-sm font-semibold transition-colors hover:border-charcoal hover:bg-charcoal hover:text-cream"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Bestsellers() {
  const feature = getDish("hyderabadi-dum-biryani")!;
  const list = dishes.filter((d) => d.badges.includes("bestseller") && d.id !== feature.id).slice(0, 4);
  return (
    <section aria-labelledby="best-title" className="container-x py-16 sm:py-20">
      <SectionHeading
        index="03"
        eyebrow="Bestsellers"
        title={
          <span id="best-title">
            The ones people <span className="italic text-chili">keep</span> coming back for.
          </span>
        }
        action={{ href: "/menu?sort=popular", label: "All bestsellers" }}
      />
      <div className="mt-12 grid gap-x-6 gap-y-12 lg:grid-cols-[1.1fr_2fr]">
        <Reveal>
          <Link href={`/food/${feature.slug}`} className="group relative block h-full overflow-hidden rounded-[2rem] bg-charcoal text-cream">
            <FoodImage
              src={feature.image}
              alt={feature.name}
              className="absolute inset-0 h-full w-full opacity-80 [&_img]:group-hover:scale-105"
              sizes="(min-width: 1024px) 35vw, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/30 to-transparent" aria-hidden />
            <div className="relative flex min-h-[460px] flex-col justify-end p-7 sm:p-9 lg:min-h-full">
              <p className="eyebrow text-saffron">No. 1 this month</p>
              <p className="mt-3 font-display text-4xl font-semibold leading-[1] sm:text-5xl">{feature.name}</p>
              <p className="mt-3 max-w-sm text-cream/75">{feature.short}</p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-cream px-5 py-3 font-semibold text-charcoal transition-colors group-hover:bg-saffron">
                Customize & order <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        </Reveal>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {list.map((d, i) => (
            <Reveal key={d.id} delay={i * 80}>
              <FoodCard dish={d} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComboBand() {
  const picks = ["the-scorcher", "masala-loaded-fries", "mango-lassi"].map((id) => getDish(id)!);
  return (
    <section aria-labelledby="combo-title" className="relative overflow-hidden bg-saffron">
      <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-charcoal/70">04 / Build your combo</p>
          <h2 id="combo-title" className="mt-3 text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-7xl">
            Main. Side. Cooler.
            <br />
            <span className="italic">Save {COMBO_DISCOUNT}%.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg text-charcoal/75">
            Mix any main with any side and a drink, set the heat on each, and we&apos;ll knock {COMBO_DISCOUNT}% off the lot.
          </p>
          <ButtonLink href="/combo" variant="dark" size="lg" className="mt-8">
            Start building
          </ButtonLink>
        </div>
        <ol className="relative flex items-center justify-center gap-3 sm:gap-5">
          {picks.map((d, i) => (
            <li key={d.id} className="flex items-center gap-3 sm:gap-5">
              <Reveal delay={i * 120} className="text-center">
                <div className="relative">
                  <FoodImage
                    src={d.image}
                    alt=""
                    label={d.name}
                    className="aspect-square w-[24vw] max-w-44 rounded-full border-4 border-charcoal shadow-[var(--shadow-lift)] sm:w-40"
                    sizes="180px"
                  />
                  <span className="absolute -top-1 left-1 grid h-8 w-8 place-items-center rounded-full bg-charcoal font-mono text-xs font-bold text-saffron">
                    {i + 1}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold sm:text-sm">{d.name}</p>
              </Reveal>
              {i < picks.length - 1 && (
                <span aria-hidden className="font-display text-3xl font-semibold sm:text-5xl">
                  +
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function KitchenStory() {
  const points = [
    { icon: Flame, title: "Cooked over real fire", body: "Charcoal, wok and tandoor — never a microwave in sight." },
    { icon: Timer, title: "Heat made to order", body: "Every chili measured to the level you pick on the Spice Meter." },
    { icon: Truck, title: "Sealed hot, sent fast", body: "Insulated packaging and a median delivery time of 32 minutes." },
  ];
  return (
    <section aria-labelledby="story-title" className="container-x py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="grid grid-cols-5 gap-4">
            <FoodImage src={photos.chef} alt="A chef plating food at the pass" className="col-span-3 aspect-[3/4] rounded-[2rem]" sizes="30vw" />
            <div className="col-span-2 flex flex-col gap-4 pt-16">
              <FoodImage src={photos.spices} alt="Bowls of whole spices and dried chilies" className="aspect-square rounded-[1.5rem]" sizes="20vw" />
              <div className="rounded-[1.5rem] bg-charcoal p-5 text-cream">
                <p className="font-display text-4xl font-semibold">18h</p>
                <p className="text-sm text-cream/70">our chili oil steeps before it touches a dish</p>
              </div>
            </div>
          </div>
        </Reveal>
        <div>
          <p className="eyebrow text-chili-deep">05 / The kitchen</p>
          <h2 id="story-title" className="mt-3 text-4xl font-medium leading-[1.02] sm:text-5xl lg:text-6xl">
            Heat is an ingredient. <span className="italic text-chili">We treat it like one.</span>
          </h2>
          <p className="mt-5 text-lg text-ash">
            SPICY started as a (fictional) late-night stall obsessed with one question: how do you make food hotter without
            making it worse? The answer was layering — fresh, dried, fermented and smoked chilies, each doing a different job.
          </p>
          <HeatLine className="my-8 w-40" />
          <ul className="space-y-6">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-chili-soft text-chili">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold">{p.title}</p>
                  <p className="text-ash">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ReviewWall() {
  const reviews = demoReviews.filter((r) => r.status === "published").slice(0, 3);
  return (
    <section aria-labelledby="reviews-title" className="dark-surface bg-charcoal text-cream">
      <div className="container-x py-20 sm:py-24">
        <SectionHeading
          dark
          index="06"
          eyebrow="Word of mouth"
          title={<span id="reviews-title">Sweaty foreheads. Happy faces.</span>}
          action={{ href: "/support", label: "Read all reviews" }}
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => {
            const dish = getDish(r.dishId);
            return (
              <li key={r.id}>
                <Reveal delay={i * 90} className="flex h-full flex-col rounded-[1.75rem] bg-white/[0.05] p-7 ring-1 ring-white/10">
                  <Quote className="h-8 w-8 text-chili" aria-hidden />
                  <p className="mt-4 font-display text-2xl font-medium leading-snug">“{r.title}”</p>
                  <p className="mt-3 flex-1 text-cream/70">{r.body}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                    <div>
                      <p className="font-semibold">{r.author}</p>
                      {dish && (
                        <Link href={`/food/${dish.slug}`} className="text-saffron hover:underline">
                          {dish.name}
                        </Link>
                      )}
                    </div>
                    <Stars value={r.rating} />
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function OffersTeaser() {
  return (
    <section className="container-x pt-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-chili-deep px-7 py-12 text-white sm:px-12 sm:py-16">
        <ChiliIcon className="absolute -right-10 -top-10 h-64 w-64 rotate-12 text-white/10" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-white">First order?</p>
            <p className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">₹100 off with FIRSTBITE.</p>
            <p className="mt-3 text-white">Plus free delivery on every order over ₹599. All offers are part of this demo.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <ButtonLink href="/offers" variant="light" size="lg">
              See all offers
            </ButtonLink>
            <ButtonLink href="/register" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-chili-deep">
              Create account
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
