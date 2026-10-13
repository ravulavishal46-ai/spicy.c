import { BackButton } from "@/components/layout/back-button";
import { Logo } from "@/components/ui/brand";
import { FoodImage } from "@/components/ui/food-image";
import { photos } from "@/lib/data/images";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="dark-surface relative hidden overflow-hidden bg-charcoal text-cream lg:block">
        <FoodImage src={photos.auth} alt="" label="SPICY" priority className="absolute inset-0 h-full w-full opacity-70" sizes="50vw" />
        <div className="absolute inset-0 bg-linear-to-t from-charcoal via-charcoal/40 to-charcoal/10" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo dark />
          <div>
            <p className="font-display text-6xl font-medium leading-[0.95] tracking-tight">
              Your heat.
              <br />
              <span className="italic text-saffron">Remembered.</span>
            </p>
            <p className="mt-5 max-w-sm text-cream/75">
              Save your spice level, favourite dishes and addresses. Reorder your usuals in one tap.
            </p>
          </div>
        </div>
      </aside>
      <main id="main" className="grain flex flex-col px-5 py-8 sm:px-10">
        <div className="-ml-2 flex items-center gap-1">
          <BackButton hideOn={[]} />
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-center text-xs text-ash">Sign-in codes are sent by Supabase. Orders and payments in this prototype are still simulated.</p>
      </main>
    </div>
  );
}
