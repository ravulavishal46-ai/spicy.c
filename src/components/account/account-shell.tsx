"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Receipt, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { signOut } from "@/lib/auth";
import { useUser } from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Profile", icon: UserRound },
  { href: "/account/orders", label: "Orders", icon: Receipt },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useUser();
  // Order tracking stays reachable for guest checkouts.
  const isTracking = /^\/account\/orders\/[^/]+$/.test(pathname);

  if (isTracking) return <>{children}</>;

  if (!hydrated) {
    return (
      <div className="container-x py-14" role="status" aria-label="Loading your account">
        <Skeleton className="h-16 w-72" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <Skeleton className="h-56" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-saffron-soft text-chili">
          <UserRound className="h-9 w-9" aria-hidden />
        </div>
        <h1 className="mt-6 text-5xl font-medium">Sign in to continue</h1>
        <p className="mt-3 max-w-md text-ash">Your orders, favorites and saved addresses live in your SPICY account.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</ButtonLink>
<ButtonLink href={`/register?next=${encodeURIComponent(pathname)}`} variant="outline">
            Create account
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x grid gap-8 pb-10 pt-10 lg:grid-cols-[240px_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="hidden items-center gap-3 lg:flex">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-saffron font-display text-xl font-bold">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-ash">{user.email}</p>
          </div>
        </div>
        <nav aria-label="Account" className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:mt-8 lg:px-0">
          <ul className="flex gap-2 lg:flex-col lg:gap-1">
            {links.map((l) => {
              const active = l.href === "/account" ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-2xl lg:py-3 lg:text-base",
                      active ? "bg-charcoal text-cream" : "bg-white hover:bg-cream-200 lg:bg-transparent",
                    )}
                  >
                    <l.icon className="h-4 w-4" aria-hidden />
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="hidden lg:block">
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-ash transition-colors hover:bg-chili-soft hover:text-chili-deep"
              >
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AccountHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow text-chili-deep">{eyebrow}</p>
        <h1 className="mt-2 text-5xl font-medium leading-none">{title}</h1>
      </div>
      {children}
    </div>
  );
}
