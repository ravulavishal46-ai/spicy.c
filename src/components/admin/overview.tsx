"use client";

import Link from "next/link";
import { ArrowRight, ChefHat, IndianRupee, Receipt, Star, Timer } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Stars } from "@/components/ui/misc";
import { ADMIN_NOW, dailySeries } from "@/lib/admin/data";
import { adminInventory, adminOrders, adminReviews, done, stockLevel } from "@/lib/admin/store";
import { useHydrated } from "@/lib/store/create-store";
import type { OrderStatus } from "@/lib/types";
import { money, pluralize } from "@/lib/utils";
import { AdminPageHeader } from "./admin-shell";
import { OrderStatusPill, Panel, StatCard, StockPill } from "./bits";
import { compact, LineChart } from "./charts";

export const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "preparing",
  preparing: "packed",
  packed: "on-the-way",
  "on-the-way": "delivered",
};
export const nextLabel: Partial<Record<OrderStatus, string>> = {
  placed: "Accept",
  preparing: "Mark packed",
  packed: "Hand to rider",
  "on-the-way": "Mark delivered",
};

function minutesAgo(iso: string) {
  const m = Math.max(0, Math.round((ADMIN_NOW - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}

export function Overview() {
  const hydrated = useHydrated();
  const orders = adminOrders.useStore();
  const inventory = adminInventory.useStore();
  const reviews = adminReviews.useStore();
  const series = dailySeries(14);
  const today = series[series.length - 1];
  const yesterday = series[series.length - 2];
  const live = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const alerts = inventory.filter((i) => stockLevel(i.stock, i.par) !== "ok").sort((a, b) => a.stock / a.par - b.stock / b.par);
  const pending = reviews.filter((r) => r.status === "pending");

  const dishCounts = new Map<string, number>();
  orders.forEach((o) => o.items.forEach((it) => dishCounts.set(it.name, (dishCounts.get(it.name) ?? 0) + it.qty)));
  const top = [...dishCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  function advance(id: string, from: OrderStatus) {
    const to = nextStatus[from];
    if (!to) return;
    adminOrders.set((list) => list.map((o) => (o.id === id ? { ...o, status: to } : o)));
    done("orders", "Order status updated", id, `${from} → ${to}`, () =>
      adminOrders.set((list) => list.map((o) => (o.id === id ? { ...o, status: from } : o))),
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Good evening, Demo."
        description="Tuesday dinner rush · all figures are simulated."
        actions={
          <ButtonLink href="/admin/analytics" variant="outline" size="sm">
            Full analytics <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Revenue today"
          value={money(today.revenue)}
          delta={((today.revenue - yesterday.revenue) / yesterday.revenue) * 100}
          hint="vs yesterday"
          icon={<IndianRupee className="h-4 w-4" aria-hidden />}
        />
        <StatCard
          label="Orders today"
          value={String(today.orders)}
          delta={((today.orders - yesterday.orders) / yesterday.orders) * 100}
          hint="vs yesterday"
          icon={<Receipt className="h-4 w-4" aria-hidden />}
        />
        <StatCard label="Avg. order value" value={money(today.revenue / today.orders)} delta={2.4} hint="7-day avg" icon={<ChefHat className="h-4 w-4" aria-hidden />} />
        <StatCard label="Avg. prep time" value="14.2 min" delta={-3.1} hint="faster is better" icon={<Timer className="h-4 w-4" aria-hidden />} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Revenue · last 14 days" action={<span className="font-mono text-xs text-ash">₹, daily</span>}>
          <LineChart
            label="Daily revenue, last 14 days"
            data={series.map((d) => ({
              x: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
              y: d.revenue,
            }))}
            format={(n) => "₹" + compact(n)}
          />
        </Panel>

        <Panel
          title={`Live orders (${hydrated ? live.length : "–"})`}
          action={
            <Link href="/admin/orders" className="text-sm font-semibold text-chili-deep hover:underline">
              View all
            </Link>
          }
        >
          {hydrated && live.length === 0 ? (
            <p className="py-10 text-center text-sm text-ash">No active orders right now.</p>
          ) : (
            <ul className="divide-y divide-cream-200">
              {(hydrated ? live : []).slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm">
                      <span className="font-mono font-semibold">{o.id}</span>
                      <span className="text-xs text-ash">{minutesAgo(o.createdAt)}</span>
                    </p>
                    <p className="truncate text-sm text-ash">
                      {o.customerName} · {pluralize(o.items.reduce((s, i) => s + i.qty, 0), "item")} · {money(o.total)}
                    </p>
                  </div>
                  <OrderStatusPill status={o.status} />
                  <Button size="sm" variant="dark" onClick={() => advance(o.id, o.status)} className="hidden sm:inline-flex">
                    {nextLabel[o.status]}
                  </Button>
                </li>
              ))}
              {!hydrated &&
                [0, 1, 2, 3].map((i) => (
                  <li key={i} className="py-3">
                    <div className="skeleton h-10" />
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Top dishes" action={<span className="text-xs text-ash">by units, recent orders</span>}>
          <ol className="space-y-3">
            {top.map(([name, qty], i) => (
              <li key={name} className="flex items-center gap-3 text-sm">
                <span className="w-5 font-mono text-xs text-ash">{i + 1}</span>
                <span className="flex-1 truncate font-medium">{name}</span>
                <span className="font-mono text-xs">{qty} sold</span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          title="Stock alerts"
          action={
            <Link href="/admin/inventory" className="text-sm font-semibold text-chili-deep hover:underline">
              Inventory
            </Link>
          }
        >
          <ul className="space-y-3">
            {alerts.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <span className="flex-1 truncate font-medium">{i.name}</span>
                <span className="font-mono text-xs text-ash">
                  {i.stock}/{i.par} {i.unit}
                </span>
                <StockPill level={stockLevel(i.stock, i.par)} />
              </li>
            ))}
            {hydrated && alerts.length === 0 && <li className="text-sm text-ash">Everything is stocked above par.</li>}
          </ul>
        </Panel>

        <Panel
          title={`Reviews to moderate (${hydrated ? pending.length : "–"})`}
          action={
            <Link href="/admin/reviews" className="text-sm font-semibold text-chili-deep hover:underline">
              Moderate
            </Link>
          }
        >
          {hydrated && pending.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-ash">
              <Star className="h-4 w-4" aria-hidden /> All caught up.
            </p>
          ) : (
            <ul className="space-y-4">
              {pending.slice(0, 3).map((r) => (
                <li key={r.id} className="text-sm">
                  <Stars value={r.rating} />
                  <p className="mt-1 font-semibold">{r.title}</p>
                  <p className="line-clamp-2 text-ash">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
