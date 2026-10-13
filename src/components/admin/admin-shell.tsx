"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  Layers,
  Menu as MenuIcon,
  MessageSquareText,
  Receipt,
  Settings,
  ShieldAlert,
  Ticket,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { ChiliIcon } from "@/components/ui/brand";
import { Drawer } from "@/components/ui/dialog";
import { adminInventory, adminOrders, adminReviews, stockLevel } from "@/lib/admin/store";
import { useHydrated } from "@/lib/store/create-store";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Operate",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", icon: Receipt, badge: "orders" as const },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes, badge: "inventory" as const },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/menu", label: "Menu items", icon: UtensilsCrossed },
      { href: "/admin/categories", label: "Categories", icon: Layers },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText, badge: "reviews" as const },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings & audit", icon: Settings },
    ],
  },
];

function useBadges() {
  const hydrated = useHydrated();
  const orders = adminOrders.useStore();
  const inventory = adminInventory.useStore();
  const reviews = adminReviews.useStore();
  if (!hydrated) return { orders: 0, inventory: 0, reviews: 0 };
  return {
    orders: orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length,
    inventory: inventory.filter((i) => stockLevel(i.stock, i.par) !== "ok").length,
    reviews: reviews.filter((r) => r.status === "pending").length,
  };
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const badges = useBadges();
  return (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="eyebrow mb-2 px-3 text-cream/40">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const count = item.badge ? badges[item.badge] : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-white/10 text-cream" : "text-cream/65 hover:bg-white/[0.06] hover:text-cream",
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", active && "text-saffron")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className="rounded-full bg-saffron px-2 py-0.5 font-mono text-[0.65rem] font-bold text-charcoal">
                        {count}
                        <span className="sr-only"> need attention</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-[#f6f3ef]">
      <div role="note" className="relative z-40 flex items-center justify-center gap-2 bg-saffron px-4 py-2 text-center text-xs font-semibold text-charcoal sm:text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          Admin prototype — <strong>not secured.</strong> No authentication or server-side authorization yet. Mock data only.
        </span>
      </div>
      <div className="lg:grid lg:grid-cols-[256px_1fr]">
        <aside className="dark-surface sticky top-0 hidden h-dvh flex-col overflow-y-auto bg-charcoal px-3 py-5 text-cream lg:flex">
          <Link href="/admin" className="mb-7 flex items-center gap-2 px-3 font-display text-2xl font-bold tracking-tight">
            SPICY <ChiliIcon className="h-4 w-4 -translate-y-1 text-chili" />
            <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-cream/70">
              Admin
            </span>
          </Link>
          <Nav />
          <div className="mt-auto pt-6">
            <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-cream/65 hover:bg-white/[0.06] hover:text-cream">
              <ExternalLink className="h-4 w-4" aria-hidden /> View storefront
            </Link>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron font-display font-bold text-charcoal">D</span>
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">Demo Admin</p>
                <p className="truncate text-xs text-cream/50">Simulated · no real login</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-charcoal/[0.08] bg-[#f6f3ef]/90 px-4 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-charcoal/5"
              aria-label="Open admin navigation"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <span className="font-display text-xl font-bold">SPICY Admin</span>
            <span className="ml-auto rounded-full bg-saffron px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider">Unsecured prototype</span>
          </header>
          <main id="main" className="px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">
            {children}
          </main>
        </div>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="SPICY Admin" side="left" dark>
        <div className="px-3 py-5">
          <Nav onNavigate={() => setOpen(false)} />
          <Link href="/" className="mt-6 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-cream/65 hover:text-cream">
            <ExternalLink className="h-4 w-4" aria-hidden /> View storefront
          </Link>
        </div>
      </Drawer>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold leading-tight">{title}</h1>
        {description && <p className="mt-1 text-ash">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
