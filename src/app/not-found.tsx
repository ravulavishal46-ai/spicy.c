import Link from "next/link";
import { ChiliIcon, Logo } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grain flex min-h-dvh flex-col px-5 py-8 sm:px-10">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="flex items-center font-display text-[clamp(6rem,22vw,14rem)] font-semibold leading-none tracking-tighter">
          4<ChiliIcon className="mx-2 h-[0.7em] w-[0.7em] text-chili" />4
        </p>
        <h1 className="mt-4 text-4xl font-medium sm:text-5xl">This page went up in smoke.</h1>
        <p className="mt-3 max-w-md text-ash">The link may be broken, or the dish may have left the menu.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/menu" variant="outline">Browse the menu</ButtonLink>
        </div>
        <Link href="/support" className="mt-6 text-sm font-semibold text-ash hover:text-charcoal">Need help?</Link>
      </div>
    </main>
  );
}
