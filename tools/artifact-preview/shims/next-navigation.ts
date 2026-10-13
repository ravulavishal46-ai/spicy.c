"use client";

import { useMemo } from "react";
import { useRouterContext } from "./router";

export function usePathname() {
  return useRouterContext().location.pathname;
}

export function useSearchParams() {
  const { search } = useRouterContext().location;
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useRouter() {
  const { navigate, back, forward } = useRouterContext();
  return useMemo(
    () => ({
      push: (href: string, opts?: { scroll?: boolean }) => navigate(href, opts),
      replace: (href: string, opts?: { scroll?: boolean }) => navigate(href, { ...opts, replace: true }),
      back,
      forward,
      refresh: () => {},
      prefetch: () => {},
    }),
    [navigate, back, forward],
  );
}

export function useParams() {
  return {};
}
