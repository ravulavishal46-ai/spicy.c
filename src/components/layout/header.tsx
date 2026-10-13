"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Menu as MenuIcon, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import { BackButton } from "./back-button";
import { Drawer } from "@/components/ui/dialog";
import { categories } from "@/lib/data/menu";
import { openCart, signOut, useCartTotals, useUser } from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import { cn, pluralize } from "@/lib/utils";

const nav = [
  { href: "/menu", label: "Menu" },
  { href: "/combo", label: "Build a Combo" },
  { href: "/offers", label: "Offers" },
  { href: "/support", label: "Reviews & Help" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const totals = useCartTotals();
  const user = useUser();
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const count = hydrated ? totals.itemCount : 0;

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-charcoal px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="dark-surface bg-charcoal text-cream">
        <p className="container-x flex h-9 items-center justify-center gap-2 text-center text-xs sm:text-[0.8rem]">
          <span className="font-mono text-saffron">HEAT20</span>
          <span className="text-cream/80">20% off orders over ₹399 ·</span>
          <Link href="/offers" className="font-semibold underline-offset-2 hover:underline">
            All offers
          </Link>
        </p>
      </div>
      <header className="sticky top-0 z-40 border-b border-charcoal/[0.07] bg-cream/88 backdrop-blur-md">
        <div className="container-x flex h-[4.25rem] items-center gap-1.5 sm:gap-4 lg:gap-8">
          <div className="-ml-2 flex items-center">
            <BackButton />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-charcoal/5 lg:hidden"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
          <Logo />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors hover:text-chili-deep",
                        active && "text-chili-deep after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-chili",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <form
            role="search"
            className="ml-auto hidden flex-1 md:block md:max-w-xs"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/menu${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
            }}
          >
            <label htmlFor="header-search" className="sr-only">
              Search dishes
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" aria-hidden />
              <input
                id="header-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search biryani, wings, tacos…"
                className="h-11 w-full rounded-full border-[1.5px] border-transparent bg-white pl-10 pr-4 text-sm shadow-[var(--shadow-soft)] placeholder:text-ash/80 focus:border-charcoal focus:outline-none"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              href="/menu"
              className="grid h-11 w-11 place-items-center rounded-full hover:bg-charcoal/5 md:hidden"
              aria-label="Search the menu"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/account/favorites"
              className="hidden h-11 w-11 place-items-center rounded-full hover:bg-charcoal/5 sm:grid"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href={hydrated && user ? "/account" : "/login"}
              className="grid h-11 w-11 place-items-center rounded-full hover:bg-charcoal/5"
              aria-label={hydrated && user ? `Account for ${user.name}` : "Sign in"}
            >
              {hydrated && user ? (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-saffron font-display text-sm font-bold">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative ml-1 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-charcoal pl-3.5 pr-4 text-sm font-semibold text-cream transition-colors hover:bg-chili-deep"
              aria-label={`Open bag, ${pluralize(count, "item")}`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
              <span key={count} className={cn("min-w-3 text-center", count > 0 && "animate-pop")}>
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <nav aria-label="Mobile" className="px-6 py-4">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...nav, { href: "/account", label: "My account" }, { href: "/account/orders", label: "My orders" }].map(
              (item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-3 py-3 font-display text-2xl font-medium hover:bg-white"
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.label}
                    <span aria-hidden className="text-chili">→</span>
                  </Link>
                </li>
              ),
            )}
          </ul>
          <p className="eyebrow mb-3 mt-8 text-ash">Categories</p>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/menu/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-block rounded-full border border-charcoal/15 px-3.5 py-2 text-sm font-medium hover:border-charcoal hover:bg-white"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-cream-300 pt-6 text-sm">
            {hydrated && user ? (
              <button
                type="button"
                className="cursor-pointer font-semibold text-chili-deep"
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
              >
                Sign out ({user.email})
              </button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-semibold text-chili-deep">
                Sign in or create an account
              </Link>
            )}
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="mt-3 block text-ash hover:text-charcoal">
              Admin prototype →
            </Link>
          </div>
        </nav>
      </Drawer>
    </>
  );
}
