/* eslint-disable @next/next/no-img-element -- preview shim replaces next/image */
"use client";

import type { ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
};

declare global {
  interface Window {
    __SPICY_IMAGES?: Record<string, string>;
  }
}

/** Drop-in for next/image in the single-file preview: a plain <img> using embedded photos. */
export default function Image({ fill, priority, quality, style, alt, src, ...rest }: ImageProps) {
  void quality;
  return (
    <img
      {...rest}
      src={window.__SPICY_IMAGES?.[src] ?? src}
      alt={alt ?? ""}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
    />
  );
}
