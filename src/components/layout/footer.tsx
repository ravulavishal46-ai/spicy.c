import Link from "next/link";
import { ChiliIcon } from "@/components/ui/brand";
import { categories } from "@/lib/data/menu";

const columns = [
  {
    title: "Eat",
    links: [
      { href: "/menu", label: "Full menu" },
      { href: "/combo", label: "Build a Combo" },
      { href: "/offers", label: "Offers & coupons" },
      ...categories.slice(0, 3).map((c) => ({ href: `/menu/${c.slug}`, label: c.name })),
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Profile" },
      { href: "/account/orders", label: "Order history" },
      { href: "/account/favorites", label: "Favorites" },
      { href: "/account/addresses", label: "Saved addresses" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/support", label: "Reviews & support" },
      { href: "/support#faq", label: "FAQ" },
      { href: "/admin", label: "Admin prototype" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="dark-surface relative mt-24 overflow-hidden bg-charcoal text-cream">
      <div className="container-x pb-10 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
              Turn up
              <br />
              the <span className="italic text-saffron">taste.</span>
            </p>
            <p className="mt-5 max-w-sm text-cream/65">
              A design prototype for a chili-forward kitchen. Everything here — dishes, orders, people — is fictional.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-saffron">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-cream/75 transition-colors hover:text-cream">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="select-none overflow-hidden whitespace-nowrap border-y border-white/10 py-4">
        <div className="flex w-max animate-marquee gap-10 font-display text-[clamp(3rem,9vw,8rem)] font-bold leading-none tracking-tight text-white/[0.06]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-10">
              SPICY <ChiliIcon className="h-[0.6em] w-[0.6em] text-chili/40" /> TURN UP THE TASTE{" "}
              <ChiliIcon className="h-[0.6em] w-[0.6em] text-saffron/30" />
            </span>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 py-6 text-xs text-cream/50 sm:flex-row sm:justify-between">
        <p>© 2026 SPICY (fictional). Built as a frontend prototype.</p>
        <p>No real orders, payments, or accounts are processed.</p>
      </div>
    </footer>
  );
}
