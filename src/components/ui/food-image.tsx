"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChiliIcon } from "./brand";

/**
 * Photo with a designed fallback. If the image can't load (offline, blocked
 * network, missing photo) we show a branded panel instead of a broken image.
 */
export function FoodImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
  label,
  tone = "dark",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Text shown in the fallback panel. Defaults to the alt text. */
  label?: string;
  tone?: "dark" | "warm";
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden", tone === "dark" ? "bg-charcoal-800" : "bg-saffron-soft", className)}>
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={70}
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-700 ease-out"
        />
      ) : (
        <Fallback label={label ?? alt} tone={tone} />
      )}
    </div>
  );
}

const palettes = [
  { bg: "bg-charcoal", text: "text-cream", blobA: "bg-chili/85", blobB: "bg-saffron/70", chili: "text-saffron" },
  { bg: "bg-chili-deep", text: "text-cream", blobA: "bg-charcoal/70", blobB: "bg-saffron/80", chili: "text-saffron" },
  { bg: "bg-saffron", text: "text-charcoal", blobA: "bg-chili/80", blobB: "bg-cream/70", chili: "text-chili-deep" },
  { bg: "bg-cream-200", text: "text-charcoal", blobA: "bg-saffron/80", blobB: "bg-chili/75", chili: "text-chili" },
];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function Fallback({ label, tone }: { label: string; tone: "dark" | "warm" }) {
  const initial = label.trim().charAt(0).toUpperCase() || "S";
  const h = hash(label);
  const p = tone === "warm" ? palettes[2] : palettes[h % palettes.length];
  const flip = h % 2 === 0;
  return (
    <div role="img" aria-label={label} className={cn("absolute inset-0 flex items-center justify-center overflow-hidden", p.bg, p.text)}>
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.1]" preserveAspectRatio="none">
        <defs>
          <pattern id="fallback-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fallback-dots)" />
      </svg>
      <div
        aria-hidden
        className={cn("absolute h-1/2 w-1/2 rounded-full", p.blobA, flip ? "-bottom-1/4 -right-1/6" : "-bottom-1/4 -left-1/6")}
      />
      <div aria-hidden className={cn("absolute h-1/4 w-1/4 rounded-full", p.blobB, flip ? "-left-4 -top-4" : "-right-3 top-4")} />
      <div className="relative flex flex-col items-center gap-1">
        <span className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold italic leading-none">{initial}</span>
        <ChiliIcon className={cn("h-4 w-4", p.chili)} />
      </div>
    </div>
  );
}
