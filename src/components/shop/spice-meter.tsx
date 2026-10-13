"use client";

import { useId, useRef } from "react";
import { Info } from "lucide-react";
import { ChiliIcon } from "@/components/ui/brand";
import { spiceInfo, spiceLevels } from "@/lib/data/spice";
import type { SpiceLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const heatColors = ["#f5b971", "#ffb547", "#f7812f", "#e63920", "#a8170a"];

/** Compact, read-only heat indicator used on cards and lists. */
export function SpiceDots({ level, className, light }: { level: SpiceLevel; className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} title={`${spiceInfo(level).name} heat`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <ChiliIcon
          key={i}
          className={cn("h-3.5 w-3.5", i <= level ? "text-chili" : light ? "text-white/25" : "text-charcoal/15")}
        />
      ))}
      <span className="sr-only">Spice level {level} of 5, {spiceInfo(level).name}</span>
    </span>
  );
}

/**
 * Interactive Spice Meter — a fully keyboard-accessible slider.
 * Click a chili, drag across the track, or use arrow keys / Home / End.
 */
export function SpiceMeter({
  value,
  onChange,
  houseLevel,
  locked = false,
  dark = false,
  className,
}: {
  value: SpiceLevel;
  onChange: (level: SpiceLevel) => void;
  houseLevel?: SpiceLevel;
  locked?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const labelId = useId();
  const info = spiceInfo(value);

  function levelFromX(clientX: number): SpiceLevel {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(0.999, Math.max(0, (clientX - rect.left) / rect.width));
    return (Math.floor(ratio * 5) + 1) as SpiceLevel;
  }

  function set(level: number) {
    if (locked) return;
    const next = Math.min(5, Math.max(1, level)) as SpiceLevel;
    if (next !== value) onChange(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const map: Record<string, number> = {
      ArrowRight: value + 1,
      ArrowUp: value + 1,
      ArrowLeft: value - 1,
      ArrowDown: value - 1,
      Home: 1,
      End: 5,
      PageUp: 5,
      PageDown: 1,
    };
    if (e.key in map) {
      e.preventDefault();
      set(map[e.key]);
    } else if (/^[1-5]$/.test(e.key)) {
      set(Number(e.key));
    }
  }

  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className={cn("eyebrow", dark ? "text-cream/60" : "text-ash")} id={labelId}>
          Spice meter
        </p>
        {houseLevel && (
          <p className={cn("text-xs", dark ? "text-cream/60" : "text-ash")}>
            House heat: <span className="font-semibold">{spiceInfo(houseLevel).name}</span>
          </p>
        )}
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={locked ? -1 : 0}
        aria-labelledby={labelId}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
        aria-valuetext={`${info.name}: ${info.line}`}
        aria-disabled={locked || undefined}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (locked) return;
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          set(levelFromX(e.clientX));
        }}
        onPointerMove={(e) => dragging.current && set(levelFromX(e.clientX))}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        className={cn(
          "relative mt-3 rounded-2xl p-2 outline-none transition-shadow focus-visible:ring-4",
          dark ? "bg-white/[0.06] focus-visible:ring-saffron/50" : "bg-white shadow-[var(--shadow-soft)] focus-visible:ring-saffron/60",
          locked ? "cursor-not-allowed opacity-70" : "cursor-pointer touch-none",
        )}
      >
        {/* heat track */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-charcoal/10">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-expo)]"
            style={{
              width: `${(value / 5) * 100}%`,
              background: `linear-gradient(90deg, ${heatColors.slice(0, value).join(", ")}${value === 1 ? ", " + heatColors[0] : ""})`,
            }}
          />
        </div>
        <div className="grid grid-cols-5 gap-1 pb-3">
          {spiceLevels.map((s) => {
            const active = s.level <= value;
            const current = s.level === value;
            return (
              <div key={s.level} className="flex flex-col items-center gap-1 py-1.5">
                <span
                  key={current ? `on-${value}` : "off"}
                  className={cn("grid h-10 w-10 place-items-center rounded-full transition-colors", current && "animate-pop")}
                  style={{ color: active ? heatColors[s.level - 1] : undefined }}
                >
                  <ChiliIcon
                    className={cn(
                      "h-7 w-7 transition-transform duration-300",
                      !active && (dark ? "text-white/20" : "text-charcoal/15"),
                      current && value === 5 && "animate-flicker",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "hidden text-[0.7rem] font-semibold sm:block",
                    current ? (dark ? "text-cream" : "text-charcoal") : dark ? "text-cream/45" : "text-ash",
                  )}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-start gap-3" aria-live="polite">
        <span
          className="mt-0.5 rounded-full px-2.5 py-1 font-mono text-xs font-bold text-white"
          style={{ background: heatColors[value - 1] }}
        >
          {value}/5
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold leading-tight">{info.name}</p>
          <p className={cn("text-sm", dark ? "text-cream/70" : "text-ash")}>
            {info.line} <span className="font-mono text-xs opacity-80">≈ {info.scoville}</span>
          </p>
        </div>
      </div>
      {locked && (
        <p className={cn("mt-3 flex items-center gap-2 text-sm", dark ? "text-cream/70" : "text-ash")}>
          <Info className="h-4 w-4" aria-hidden /> This dish is served at a fixed heat.
        </p>
      )}
      {value === 5 && !locked && (
        <p className="mt-3 rounded-xl bg-chili-soft px-3 py-2 text-sm font-medium text-chili-deep">
          Inferno is genuinely hot. We&apos;ll pack an extra cooling dip, just in case.
        </p>
      )}
    </div>
  );
}
