"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, CircleDashed, Clock, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import type { StockLevel } from "@/lib/admin/store";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-charcoal/[0.04]">
      <div className="flex items-center justify-between text-sm text-ash">
        <span>{label}</span>
        {icon}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-1 font-semibold", up ? "text-leaf" : "text-chili-deep")}>
            {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
            {up ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-ash">{hint}</span>}
      </div>
    </div>
  );
}

const orderStatusMeta: Record<OrderStatus, { label: string; cls: string; icon: React.ElementType }> = {
  placed: { label: "New", cls: "bg-saffron-soft text-[#7a4a00]", icon: CircleDashed },
  preparing: { label: "Cooking", cls: "bg-chili-soft text-chili-deep", icon: Clock },
  packed: { label: "Packed", cls: "bg-[#e6eefc] text-[#1f4fa3]", icon: CheckCircle2 },
  "on-the-way": { label: "On the way", cls: "bg-[#e6eefc] text-[#1f4fa3]", icon: Clock },
  delivered: { label: "Delivered", cls: "bg-leaf-soft text-leaf", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", cls: "bg-cream-200 text-ash", icon: XCircle },
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const m = orderStatusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", m.cls)}>
      <m.icon className="h-3.5 w-3.5" aria-hidden />
      {m.label}
    </span>
  );
}

export const orderStatusLabel = (s: OrderStatus) => orderStatusMeta[s].label;

export function StockPill({ level }: { level: StockLevel }) {
  const m = {
    ok: { label: "In stock", cls: "bg-leaf-soft text-leaf", icon: CheckCircle2 },
    low: { label: "Low", cls: "bg-saffron-soft text-[#7a4a00]", icon: AlertTriangle },
    critical: { label: "Critical", cls: "bg-chili-soft text-chili-deep", icon: AlertOctagon },
  }[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", m.cls)}>
      <m.icon className="h-3.5 w-3.5" aria-hidden />
      {m.label}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  showLabel = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="inline-flex cursor-pointer items-center gap-2.5"
    >
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-leaf" : "bg-charcoal/20")}>
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </span>
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="scrollbar-none flex gap-1 overflow-x-auto rounded-full bg-cream p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
            value === o.id ? "bg-charcoal text-cream" : "text-ash hover:text-charcoal",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 font-mono text-xs opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-charcoal/[0.04] sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
