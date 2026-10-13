import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function money(value: number) {
  return inr.format(Math.round(value));
}

// A fixed zone keeps server- and browser-rendered dates identical (no hydration mismatch).
const TZ = "Asia/Kolkata";

export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function pluralize(count: number, word: string, plural = word + "s") {
  return `${count} ${count === 1 ? word : plural}`;
}
