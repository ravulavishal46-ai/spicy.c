import { AlertTriangle, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "chili" | "saffron" | "leaf" | "dark" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-cream-200 text-charcoal",
    chili: "bg-chili-soft text-chili-deep",
    saffron: "bg-saffron-soft text-[#7a4a00]",
    leaf: "bg-leaf-soft text-leaf",
    dark: "bg-charcoal text-cream",
    outline: "border border-charcoal/20 text-charcoal",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold", size === "sm" ? "text-sm" : "text-base")}>
      <Star className={cn("fill-saffron text-saffron", size === "sm" ? "h-4 w-4" : "h-5 w-5")} aria-hidden />
      <span>{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="font-normal text-ash">
          ({count.toLocaleString("en-IN")}
          <span className="sr-only"> reviews</span>)
        </span>
      )}
      <span className="sr-only">out of 5 stars</span>
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={cn("h-4 w-4", i <= value ? "fill-saffron text-saffron" : "text-cream-300")} />
      ))}
    </span>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 20,
  label,
  size = "md",
  dark,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "sm" | "md";
  dark?: boolean;
}) {
  const btn = cn(
    "grid cursor-pointer place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-35",
    size === "sm" ? "h-8 w-8" : "h-10 w-10",
    dark ? "hover:bg-white/10" : "hover:bg-charcoal/[0.07]",
  );
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className={cn(
        "inline-flex items-center rounded-full border-[1.5px]",
        dark ? "border-white/20" : "border-charcoal/15 bg-white",
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={value - 1 <= 0 && min === 0 ? `Remove ${label}` : `Decrease quantity of ${label}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span aria-live="polite" className={cn("min-w-7 text-center font-mono font-semibold", size === "sm" && "text-sm")}>
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      <div className="relative mb-6 grid h-24 w-24 place-items-center rounded-full bg-saffron-soft text-chili">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-saffron" aria-hidden />
        {icon}
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-ash">{body}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something boiled over",
  body = "We couldn't load this right now. It's simulated — try again and it should work.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-card)] border-[1.5px] border-dashed border-chili/40 bg-white px-6 py-14 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-chili-soft text-chili">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-ash">{body}</p>
      {onRetry && (
        <Button variant="dark" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  body,
  action,
  className,
  dark,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  action?: { href: string; label: string };
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <p className={cn("eyebrow flex items-center gap-3", dark ? "text-saffron" : "text-chili-deep")}>
          {index && <span className={dark ? "text-cream/50" : "text-ash"}>{index} /</span>}
          {eyebrow}
        </p>
        <h2 className="mt-3 text-4xl font-medium leading-[1.02] sm:text-5xl lg:text-6xl">{title}</h2>
        {body && <p className={cn("mt-4 max-w-xl text-lg", dark ? "text-cream/70" : "text-ash")}>{body}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 border-b-2 pb-1 font-semibold transition-colors",
            dark ? "border-saffron text-cream hover:text-saffron" : "border-chili text-charcoal hover:text-chili-deep",
          )}
        >
          {action.label}
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function PageHeader({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="container-x pb-8 pt-10 sm:pt-14">
      <p className="eyebrow text-chili-deep">{eyebrow}</p>
      <h1 className="mt-3 text-5xl font-medium leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
      {body && <p className="mt-4 max-w-2xl text-lg text-ash">{body}</p>}
      {children}
    </header>
  );
}
