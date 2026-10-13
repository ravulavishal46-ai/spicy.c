import Link from "next/link";
import { cn } from "@/lib/utils";

export function ChiliIcon({ className, filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M15.6 5.2c.9-1.8 2.6-2.6 4.1-2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.2 6.4c2.4-.9 4.6.6 4.9 3 .5 4.4-3.6 10.9-11.8 12.4-2.2.4-3.6-1.6-2.1-3 3.5-3.2 4.6-6.6 5.4-9.4.5-1.6 1.6-2.4 3.6-3Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="SPICY home"
      className={cn("group inline-flex items-center gap-1.5 font-display text-[1.65rem] font-bold leading-none tracking-[-0.04em]", className)}
    >
      <span className={dark ? "text-cream" : "text-charcoal"}>SPICY</span>
      <ChiliIcon className="h-5 w-5 -translate-y-1.5 text-chili transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
    </Link>
  );
}

/** Hand-drawn wavy divider used between editorial sections. */
export function HeatLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className={cn("h-4 w-full text-chili", className)} aria-hidden>
      <path
        d="M0 12 C 50 2, 100 22, 150 12 S 250 2, 300 12 S 400 22, 450 12 S 550 2, 600 12 S 700 22, 750 12 S 850 2, 900 12 S 1000 22, 1050 12 S 1150 2, 1200 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
