"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// In-app navigation tracking (module-level so it survives layout changes).
let lastPath: string | null = null;
let steps = 0;

/**
 * Small arrow that returns to the previous page without changing anything else.
 * Falls back to `fallback` when the visitor landed directly on this page.
 */
export function BackButton({
  className,
  dark = false,
  fallback = "/",
  hideOn = ["/"],
}: {
  className?: string;
  dark?: boolean;
  fallback?: string;
  hideOn?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== lastPath) {
      if (lastPath !== null) steps++;
      lastPath = pathname;
    }
  }, [pathname]);

  if (hideOn.includes(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => (steps > 0 ? router.back() : router.push(fallback))}
      aria-label="Go back to the previous page"
      title="Back"
      className={cn(
        "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full transition-[background-color,transform] active:scale-90",
        dark ? "text-cream hover:bg-white/10" : "text-charcoal hover:bg-charcoal/[0.07]",
        className,
      )}
    >
      <ArrowLeft className="h-[18px] w-[18px] transition-transform group-hover:-translate-x-0.5" aria-hidden />
    </button>
  );
}
