"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useHydrated } from "@/lib/store/create-store";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Esc to close, focus trap, body scroll lock and focus restore. */
function useDialogBehaviour(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbar}px`;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === "Tab" && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return panelRef;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, description, children, footer, className, size = "md" }: DialogProps) {
  const panelRef = useDialogBehaviour(open, onClose);
  const hydrated = useHydrated();
  const titleId = useId();
  const descId = useId();
  if (!open || !hydrated) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-charcoal/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full animate-rise flex-col overflow-hidden rounded-t-[1.75rem] bg-cream shadow-2xl sm:rounded-[1.75rem]",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-xl",
          size === "lg" && "sm:max-w-3xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cream-300 px-6 pb-4 pt-6">
          <div>
            <h2 id={titleId} className="text-2xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-ash">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-charcoal/5"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-cream-300 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  side = "right",
  dark = false,
}: Omit<DialogProps, "size" | "description"> & { side?: "right" | "left"; dark?: boolean }) {
  const panelRef = useDialogBehaviour(open, onClose);
  const hydrated = useHydrated();
  const titleId = useId();
  if (!open || !hydrated) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 animate-fade bg-charcoal/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-full max-w-[460px] flex-col shadow-2xl",
          side === "right" ? "right-0 animate-slide-in-right" : "left-0 animate-slide-in-left",
          dark ? "dark-surface bg-charcoal text-cream" : "bg-cream",
          className,
        )}
      >
        <div className={cn("flex items-center justify-between border-b px-6 py-5", dark ? "border-white/10" : "border-cream-300")}>
          <h2 id={titleId} className="text-2xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "grid h-10 w-10 cursor-pointer place-items-center rounded-full",
              dark ? "hover:bg-white/10" : "hover:bg-charcoal/5",
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className={cn("border-t px-6 py-5", dark ? "border-white/10" : "border-cream-300")}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
