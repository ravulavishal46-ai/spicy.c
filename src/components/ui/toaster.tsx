"use client";

import { CheckCircle2, Flame, X, XCircle } from "lucide-react";
import { dismissToast, useToasts } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-start sm:px-6"
    >
      {toasts.map((t) => {
        const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? XCircle : Flame;
        return (
          <div
            key={t.id}
            role="status"
            className="dark-surface pointer-events-auto flex w-full max-w-sm animate-toast items-center gap-3 rounded-2xl bg-charcoal py-3 pl-4 pr-2 text-cream shadow-[0_20px_40px_-12px_rgb(0_0_0/0.5)]"
          >
            <Icon
              aria-hidden
              className={cn(
                "h-5 w-5 shrink-0",
                t.tone === "success" ? "text-[#7bd88f]" : t.tone === "error" ? "text-[#ff8a75]" : "text-saffron",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="text-xs text-cream/70">{t.description}</p>}
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismissToast(t.id);
                }}
                className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold text-saffron hover:bg-white/10"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-cream/60 hover:bg-white/10 hover:text-cream"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
