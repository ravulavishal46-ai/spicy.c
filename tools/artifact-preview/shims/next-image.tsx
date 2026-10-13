/* eslint-disable @next/next/no-img-element -- preview shim replaces next/image */
"use client";

import type { ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
};

/** Drop-in for next/image in the single-file preview: a plain <img>. */
export default function Image({ fill, priority, quality, style, alt, ...rest }: ImageProps) {
  void quality;
  return (
    <img
      {...rest}
      alt={alt ?? ""}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
    />
  );
}
