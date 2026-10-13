"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Receipt, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { Badge, EmptyState, Stars } from "@/components/ui/misc";
import { SmartReorder } from "@/components/shop/smart-reorder";
import { getDish } from "@/lib/data/menu";
import { liveStatus, reorder, TRACKING_STAGES, useOrders } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { cn, formatDate, money, pluralize } from "@/lib/utils";
import { AccountHeading } from "./account-shell";

const tabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export function statusBadge(status: OrderStatus) {
  if (status === "delivered") return <Badge tone="leaf">Delivered</Badge>;
  if (status === "cancelled") return <Badge tone="neutral">Cancelled</Badge>;
  return <Badge tone="saffron">{TRACKING_STAGES.find((s) => s.status === status)?.label}</Badge>;
}

export function OrderHistory() {
  const orders = useOrders();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  // Status snapshot at render time is fine for a list; the tracking page animates live.
  const [now] = useState(() => Date.now());
  const withStatus = orders.map((o) => ({ order: o, status: liveStatus(o, now).status }));
  const filtered = withStatus.filter(({ status }) =>
    tab === "all" ? true : tab === "active" ? status !== "delivered" && status !== "cancelled" : status === tab,
  );

  return (
    <>
      <AccountHeading eyebrow={pluralize(orders.length, "order")} title="Order history" />

      <div className="mb-10 rounded-[1.75rem] bg-cream-200/70 p-5 sm:p-7">
        <SmartReorder />
      </div>

      <div role="tablist" aria-label="Filter orders" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = withStatus.filter(({ status }) =>
            t.id === "all" ? true : t.id === "active" ? status !== "delivered" && status !== "cancelled" : status === t.id,
          ).length;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.id ? "bg-charcoal text-cream" : "bg-white hover:bg-cream-200",
              )}
            >
              {t.label} <span className="ml-1 font-mono text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-9 w-9" />}
          title={tab === "active" ? "No active orders" : "No orders here"}
          body={tab === "active" ? "Hungry? Your next order will show up here while it's on its way." : "Orders matching this filter will appear here."}
          action={<ButtonLink href="/menu">Order something</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {filtered.map(({ order, status }) => {
            const thumbs = order.items.slice(0, 3).map((i) => getDish(i.dishId)).filter(Boolean);
            const active = status !== "delivered" && status !== "cancelled";
            return (
              <li key={order.id} className="rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
                <div className="flex flex-wrap items-start gap-5">
                  <div className="flex -space-x-4">
                    {thumbs.map((d, i) => (
                      <FoodImage key={i} src={d!.image} alt="" label={d!.name} className="h-16 w-16 rounded-2xl ring-4 ring-white" sizes="64px" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold">{order.id}</p>
                      {statusBadge(status)}
                    </div>
                    <p className="mt-1 line-clamp-1 font-medium">{order.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                    <p className="text-sm text-ash">
                      {formatDate(order.createdAt, true)} · {money(order.total)}
                    </p>
                    {order.rated && <Stars value={order.rated} className="mt-1" />}
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    {status !== "cancelled" && (
                      <Button variant="outline" size="sm" onClick={() => reorder(order)} className="flex-1 sm:flex-none">
                        <RotateCcw className="h-4 w-4" aria-hidden /> Reorder
                      </Button>
                    )}
                    <ButtonLink href={`/account/orders/${order.id}`} variant={active ? "primary" : "ghost"} size="sm" className="flex-1 sm:flex-none">
                      {active ? "Track" : "Details"} <ChevronRight className="h-4 w-4" aria-hidden />
                    </ButtonLink>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-8 text-center text-sm text-ash">
        Need help with an order? <Link href="/support" className="font-semibold text-chili-deep hover:underline">Contact support</Link>
      </p>
    </>
  );
}
