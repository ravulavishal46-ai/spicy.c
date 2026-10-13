import { ArrowRight, Clock, Star } from "lucide-react";
import { ChiliIcon } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { getDish } from "@/lib/data/menu";
import { money } from "@/lib/utils";

export function Hero() {
  const feature = getDish("the-scorcher")!;
  const side = getDish("chili-oil-dumplings")!;
  return (
    <section className="grain relative overflow-hidden">
      <div className="container-x grid items-center gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:pb-24 lg:pt-16">
        <div className="relative z-10">
          <p className="eyebrow inline-flex animate-rise items-center gap-2 rounded-full bg-white px-3 py-1.5 text-charcoal shadow-[var(--shadow-soft)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-chili" aria-hidden />
            Kitchen open · delivering in ~32 min
          </p>
          <h1 className="mt-6 animate-rise text-[clamp(3.4rem,10.5vw,8.4rem)] font-medium leading-[0.86] tracking-[-0.045em] [animation-delay:80ms]">
            Turn up
            <br />
            the{" "}
            <span className="relative inline-block italic text-chili">
              taste
              <svg
                aria-hidden
                viewBox="0 0 300 20"
                className="absolute -bottom-2 left-0 h-3 w-full text-saffron sm:-bottom-3 sm:h-4"
                preserveAspectRatio="none"
              >
                <path d="M2 14 C 60 2, 120 20, 180 8 S 270 4, 298 12" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-8 max-w-md animate-rise text-lg leading-relaxed text-ash [animation-delay:160ms] sm:text-xl">
            Chili-forward street food from six cuisines, cooked to the exact heat you choose. From a whisper of warmth to
            full Inferno.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap items-center gap-3 [animation-delay:240ms]">
            <ButtonLink href="/menu" size="lg">
              Order now <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/combo" size="lg" variant="outline">
              Build a combo
            </ButtonLink>
          </div>
          <dl className="mt-12 grid max-w-md animate-rise grid-cols-3 gap-6 border-t border-charcoal/10 pt-6 [animation-delay:320ms]">
            {[
              ["36", "dishes on the flame"],
              ["5", "levels of heat"],
              ["4.8★", "average rating"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-display text-3xl font-semibold">{n}</span>
                  <span className="text-sm text-ash">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] lg:mr-8">
          <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-saffron sm:h-36 sm:w-36" aria-hidden />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full border-[8px] border-chili sm:h-24 sm:w-24" aria-hidden />
          <div className="relative animate-[rise_1s_var(--ease-out-expo)_both] overflow-hidden rounded-[2rem] rounded-tr-[5rem] shadow-[var(--shadow-lift)]">
            <FoodImage
              src={feature.image}
              alt={`${feature.name}: ${feature.short}`}
              priority
              className="aspect-[4/4.6] w-full"
              sizes="(min-width: 1024px) 400px, 90vw"
            />
          </div>

          {/* floating stamp */}
          <div className="absolute -left-3 top-8 grid h-24 w-24 rotate-[-12deg] animate-[pop_0.8s_var(--ease-spring)_0.6s_both] place-items-center rounded-full bg-chili text-center text-white shadow-xl sm:-left-8 sm:h-28 sm:w-28">
            <div>
              <ChiliIcon className="mx-auto h-6 w-6 text-saffron" />
              <p className="mt-1 font-display text-lg font-semibold leading-none">Inferno</p>
              <p className="font-mono text-[0.6rem] uppercase tracking-widest text-white/80">level 5</p>
            </div>
          </div>

          {/* feature card */}
          <div className="absolute -bottom-6 right-3 w-[min(78%,300px)] animate-[rise_0.9s_var(--ease-out-expo)_0.5s_both] rounded-3xl bg-white p-4 shadow-[var(--shadow-lift)] sm:-right-6">
            <div className="flex items-center gap-3">
              <FoodImage src={side.image} alt="" label={side.name} className="h-14 w-14 shrink-0 rounded-2xl" sizes="60px" />
              <div className="min-w-0">
                <p className="eyebrow text-chili-deep">Tonight&apos;s favourite</p>
                <p className="truncate font-display text-lg font-semibold">{side.name}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-cream-300 pt-3 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-saffron text-saffron" aria-hidden /> {side.rating}
              </span>
              <span className="inline-flex items-center gap-1 text-ash">
                <Clock className="h-4 w-4" aria-hidden /> {side.prepMinutes} min
              </span>
              <span className="font-display text-lg font-semibold">{money(side.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
