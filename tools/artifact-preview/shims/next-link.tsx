"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useRouterContext } from "./router";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string; query?: Record<string, string> };
  prefetch?: boolean | "auto" | null;
  replace?: boolean;
  scroll?: boolean;
};

/** Drop-in for next/link that navigates inside the single-page preview. */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch: _prefetch, replace, scroll, onClick, ...rest },
  ref,
) {
  void _prefetch;
  const { navigate } = useRouterContext();
  const url =
    typeof href === "string"
      ? href
      : `${href.pathname ?? ""}${href.query ? "?" + new URLSearchParams(href.query).toString() : ""}`;
  const internal = url.startsWith("/") || url.startsWith("?") || url.startsWith("#");

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || !internal) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    navigate(url, { replace, scroll });
  }

  return <a ref={ref} href={url} onClick={handleClick} {...rest} />;
});

export default Link;
