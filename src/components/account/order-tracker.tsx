"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bike, Check, ChefHat, CircleHelp, Home, Package, PartyPopper, Phone, Play, Receipt, RotateCcw, Star, XCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { spiceInfo } from "@/lib/data/spice";
import {
  cancelOrder,
  liveStatus,
  rateOrder,
  reorder,
  restartTrackingDemo,
  toast,
  TRACKING_STAGES,
  useOrders,
} from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import type { Order } from "@/lib/types";
import { cn, formatDate, formatTime, money } from "@/lib/utils";

const stageIcons = [Receipt, ChefHat, Package, Bike, Home];
const DEMO_SECONDS = TRACKING_STAGES[TRACKING_STAGES.length - 1].at;
const REAL_MINUTES = 32;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function OrderTracker({ id }: { id: string }) {
  const hydrated = useHydrated();
  const orders = useOrders();
  const order = orders.find((o) => o.id === id);

  if (!hydrated) {
    return (
      <div className="container-x py-12" role="status" aria-label="Loading order">
        <Skeleton className="h-14 w-96 max-w-full" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px]" />
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <EmptyState
        icon={<Receipt className="h-9 w-9" />}
        title="Order not found"
        body={`We couldn't find order ${id}. It may belong to another browser — orders in this prototype are stored locally.`}
        action={<ButtonLink href="/account/orders">See my orders</ButtonLink>}
      />
    );
  }
  return <Tracker order={order} />;
}

function Tracker({ order }: { order: Order }) {
  const params = useSearchParams();
  const justPlaced = params.get("placed") === "1";
  const now = useNow(order.live && order.status !== "cancelled");
  const { status, progress } = liveStatus(order, now);
  const stageIndex = TRACKING_STAGES.findIndex((s) => s.status === status);
  const cancelled = status === "cancelled";
  const delivered = status === "delivered";
  const elapsed = (now - new Date(order.createdAt).getTime()) / 1000;
  const minutesLeft = Math.max(1, Math.ceil(((DEMO_SECONDS - elapsed) / DEMO_SECONDS) * REAL_MINUTES));
  const eta = new Date(new Date(order.createdAt).getTime() + REAL_MINUTES * 60_000).toISOString();

  // rider position along the route during "on the way"
  const onWay = TRACKING_STAGES[3].at;
  const routeT = cancelled ? 0 : Math.min(1, Math.max(0, (elapsed - onWay) / (DEMO_SECONDS - onWay)));
  const riderT = delivered ? 1 : status === "on-the-way" ? routeT : 0;

  return (
    <div className="container-x pb-10 pt-8">
      {justPlaced && !cancelled && (
        <div className="mb-8 flex animate-rise items-center gap-4 rounded-[1.5rem] bg-leaf-soft px-5 py-4 text-leaf">
          <PartyPopper className="h-6 w-6 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Order placed!</span> This is a simulation — watch it move through each stage over about a minute.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-chili-deep">
            Order <span className="font-mono">{order.id}</span> · {formatDate(order.createdAt, true)}
          </p>
          <h1 className="mt-2 text-5xl font-medium leading-[0.95] sm:text-6xl" aria-live="polite">
            {cancelled ? "Order cancelled" : delivered ? "Delivered. Enjoy!" : TRACKING_STAGES[stageIndex].label + "…"}
          </h1>
          {!cancelled && !delivered && (
            <p className="mt-3 text-lg text-ash">
              Arriving in <strong className="text-charcoal">~{minutesLeft} min</strong> · by {formatTime(eta)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => restartTrackingDemo(order.id)}>
            <Play className="h-4 w-4" aria-hidden /> Replay tracking demo
          </Button>
          {status === "placed" && (
            <Button variant="danger" size="sm" onClick={() => cancelOrder(order.id)}>
              <XCircle className="h-4 w-4" aria-hidden /> Cancel order
            </Button>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* progress + map */}
        <section aria-label="Delivery progress" className="dark-surface overflow-hidden rounded-[2rem] bg-charcoal text-cream">
          <RouteMap t={riderT} cancelled={cancelled} />
          <div className="p-6 sm:p-8">
            <div
              role="progressbar"
              aria-label="Order progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="relative h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-linear", cancelled ? "bg-white/30" : "bg-saffron")}
                style={{ width: `${cancelled ? 0 : progress * 100}%` }}
              />
            </div>
            <ol className="mt-8 grid gap-5 sm:grid-cols-5 sm:gap-2">
              {TRACKING_STAGES.map((s, i) => {
                const Icon = stageIcons[i];
                const done = !cancelled && i < stageIndex;
                const current = !cancelled && i === stageIndex;
                return (
                  <li key={s.status} className="flex gap-3 sm:flex-col sm:items-start" aria-current={current ? "step" : undefined}>
                    <span
                      className={cn(
                        "relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-500",
                        done && "bg-leaf text-white",
                        current && "bg-saffron text-charcoal",
                        !done && !current && "bg-white/[0.08] text-cream/40",
                      )}
                    >
                      {current && !delivered && <span className="absolute inset-0 animate-ping rounded-full bg-saffron/40" aria-hidden />}
                      {done ? <Check className="relative h-5 w-5" aria-hidden /> : <Icon className="relative h-5 w-5" aria-hidden />}
                    </span>
                    <div>
                      <p className={cn("font-semibold", !done && !current && "text-cream/50")}>{s.label}</p>
                      <p className={cn("text-xs", current ? "text-cream/75" : "text-cream/45")}>{s.detail}</p>
                      <span className="sr-only">{done ? "completed" : current ? "in progress" : "upcoming"}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          {status === "on-the-way" && (
            <div className="flex items-center gap-4 border-t border-white/10 px-6 py-5 sm:px-8">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-saffron font-display text-lg font-bold text-charcoal">R</span>
              <div className="flex-1">
                <p className="font-semibold">Ravi (demo rider)</p>
                <p className="text-sm text-cream/60">Electric scooter · 4.9 ★</p>
              </div>
              <Button variant="light" size="icon" aria-label="Call rider (simulated)" onClick={() => toast({ title: "Calling is simulated in this prototype" })}>
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        {/* summary */}
        <section aria-labelledby="receipt" className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 id="receipt" className="text-2xl font-semibold">Receipt</h2>
          <ul className="mt-5 divide-y divide-cream-300">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    <span className="font-mono text-ash">{it.qty}×</span> {it.name}
                  </p>
                  <p className="text-xs text-ash">
                    {spiceInfo(it.spice).name} heat{it.detail ? ` · ${it.detail}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-medium">{money(it.unitPrice * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-cream-300 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ash">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between"><dt className="text-ash">Discount {order.couponCode && `(${order.couponCode})`}</dt><dd className="text-leaf">−{money(order.discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-ash">Delivery</dt><dd>{order.delivery ? money(order.delivery) : "Free"}</dd></div>
            <div className="flex justify-between"><dt className="text-ash">Taxes</dt><dd>{money(order.tax)}</dd></div>
            <div className="flex items-baseline justify-between pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-2xl font-semibold">{money(order.total)}</dd></div>
          </dl>
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm">
            <span className="font-semibold">Deliver to:</span> {order.address}
            <br />
            <span className="font-semibold">Paid by:</span> {order.payment === "cod" ? "Cash on delivery" : order.payment.toUpperCase()} (simulated)
          </p>

          {delivered && <RateOrder order={order} />}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="dark" onClick={() => reorder(order)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Reorder
            </Button>
            <ButtonLink href="/support" variant="ghost">
              <CircleHelp className="h-4 w-4" aria-hidden /> Get help
            </ButtonLink>
          </div>
        </section>
      </div>
      <p className="mt-8 text-center text-sm text-ash">
        <Link href="/account/orders" className="font-semibold hover:text-charcoal">← All orders</Link>
      </p>
    </div>
  );
}

function RateOrder({ order }: { order: Order }) {
  const [hover, setHover] = useState(0);
  const value = hover || order.rated || 0;
  return (
    <div className="mt-6 rounded-2xl border-[1.5px] border-dashed border-saffron p-4">
      <p className="font-semibold">{order.rated ? "Thanks for your rating!" : "How was it?"}</p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rate this order" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={order.rated === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => rateOrder(order.id, n)}
            className="cursor-pointer rounded-md p-1 transition-transform hover:scale-110"
          >
            <Star className={cn("h-7 w-7", n <= value ? "fill-saffron text-saffron" : "text-cream-300")} aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Stylised (not real) route map with a rider dot that travels as the order progresses. */
// The route as three cubic segments (matches `path` below, with S-curves expanded).
const segments: [number, number][][] = [
  [[60, 210], [140, 210], [150, 120], [240, 120]],
  [[240, 120], [330, 120], [330, 60], [420, 70]],
  [[420, 70], [510, 80], [520, 150], [560, 60]],
];

function pointOnRoute(t: number): [number, number] {
  const scaled = Math.min(0.9999, Math.max(0, t)) * segments.length;
  const [p0, p1, p2, p3] = segments[Math.floor(scaled)];
  const u = scaled - Math.floor(scaled);
  const m = 1 - u;
  const at = (i: 0 | 1) => m * m * m * p0[i] + 3 * m * m * u * p1[i] + 3 * m * u * u * p2[i] + u * u * u * p3[i];
  return t >= 1 ? [560, 60] : [at(0), at(1)];
}

function RouteMap({ t, cancelled }: { t: number; cancelled: boolean }) {
  const rider = pointOnRoute(t);
  const path = "M60 210 C 140 210, 150 120, 240 120 S 330 60, 420 70 S 520 150, 560 60";
  return (
    <div className="relative h-56 overflow-hidden bg-charcoal-800 sm:h-64">
      <svg viewBox="0 0 620 260" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="620" height="260" fill="url(#grid)" />
        {/* streets */}
        <path d="M0 160 H620 M0 90 H620 M180 0 V260 M380 0 V260 M500 0 V260" stroke="rgb(255 255 255 / 0.06)" strokeWidth="14" />
        <path d="M30 40 L 260 250 M 300 0 L 620 200" stroke="rgb(255 255 255 / 0.04)" strokeWidth="10" />
        {/* route */}
        <path d={path} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="5" strokeDasharray="2 10" strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke={cancelled ? "rgb(255 255 255 / 0.3)" : "#FFB547"}
          strokeWidth="5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - t}
          style={{ transition: "stroke-dashoffset 0.5s linear" }}
        />
        {/* kitchen */}
        <circle cx="60" cy="210" r="16" fill="#E63920" />
        <text x="60" y="215" textAnchor="middle" fontSize="13" fill="white" fontWeight="700">S</text>
        {/* home */}
        <circle cx="560" cy="60" r="16" fill="#FFF7ED" />
        <path d="M552 62 L560 54 L568 62 V68 H552 Z" fill="#141414" />
        {/* rider */}
        <circle cx={rider[0]} cy={rider[1]} r="11" fill="#FFB547" stroke="#141414" strokeWidth="3" style={{ transition: "cx 0.5s linear, cy 0.5s linear" }} />
      </svg>
      <div className="absolute left-4 top-4 rounded-full bg-charcoal/80 px-3 py-1.5 text-xs text-cream/80 backdrop-blur">
        Simulated map · not real location data
      </div>
    </div>
  );
}
