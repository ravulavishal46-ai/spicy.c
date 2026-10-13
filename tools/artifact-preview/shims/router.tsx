"use client";

/**
 * A tiny in-page router used only for the single-file preview build.
 * It replaces Next.js routing so the whole app can run inside one HTML page
 * (for example a Claude artifact) without a server.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

interface RouterValue {
  location: Location;
  navigate: (href: string, opts?: { replace?: boolean; scroll?: boolean }) => void;
  back: () => void;
  forward: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

/** "/a/b?x=1#y" -> parts, resolving "?x=1" or "#y" against the current page. */
export function parseHref(href: string, current: Location): Location {
  let rest = href;
  let hash = "";
  const h = rest.indexOf("#");
  if (h >= 0) {
    hash = rest.slice(h);
    rest = rest.slice(0, h);
  }
  let search = "";
  const q = rest.indexOf("?");
  if (q >= 0) {
    search = rest.slice(q);
    rest = rest.slice(0, q);
  }
  const pathname = rest === "" ? current.pathname : rest;
  if (rest === "" && !search && hash) search = current.search;
  return { pathname: pathname || "/", search: search === "?" ? "" : search, hash };
}

/** Plain anchor token (allowed by the artifact viewer) <-> path. "dashboard~requests" <-> "/dashboard/requests" */
const toToken = (pathname: string) => (pathname === "/" ? "" : pathname.slice(1).replace(/\//g, "~"));
const fromToken = (token: string) => "/" + token.replace(/~/g, "/");

function initialLocation(): Location {
  try {
    const token = window.location.hash.slice(1);
    if (token && /^[A-Za-z0-9._~-]+$/.test(token)) return { pathname: fromToken(token), search: "", hash: "" };
  } catch {
    /* ignore */
  }
  return { pathname: "/", search: "", hash: "" };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<{ entries: Location[]; index: number }>(() => ({
    entries: [initialLocation()],
    index: 0,
  }));
  const location = stack.entries[stack.index];
  const [pendingScroll, setPendingScroll] = useState<{ hash: string; scroll: boolean } | null>(null);

  const navigate = useCallback((href: string, opts: { replace?: boolean; scroll?: boolean } = {}) => {
    setStack((s) => {
      const next = parseHref(href, s.entries[s.index]);
      const entries = opts.replace ? s.entries.slice(0, s.index) : s.entries.slice(0, s.index + 1);
      return { entries: [...entries, next], index: entries.length };
    });
    setPendingScroll({ hash: href.includes("#") ? href.slice(href.indexOf("#") + 1) : "", scroll: opts.scroll !== false });
  }, []);

  const back = useCallback(() => setStack((s) => ({ ...s, index: Math.max(0, s.index - 1) })), []);
  const forward = useCallback(() => setStack((s) => ({ ...s, index: Math.min(s.entries.length - 1, s.index + 1) })), []);

  // Scroll to the top (or to #anchor) after navigating, like a normal website.
  useEffect(() => {
    if (!pendingScroll) return;
    const { hash, scroll } = pendingScroll;
    const t = window.setTimeout(() => {
      const target = hash ? document.getElementById(hash) : null;
      if (target) target.scrollIntoView({ block: "start" });
      else if (scroll) window.scrollTo(0, 0);
    }, 30);
    return () => window.clearTimeout(t);
  }, [pendingScroll, location]);

  // Follow manual changes to the #token (e.g. a pasted deep link).
  useEffect(() => {
    const onHash = () => {
      const token = window.location.hash.slice(1);
      if (/^[A-Za-z0-9._~-]+$/.test(token) && document.getElementById(token) === null) navigate(fromToken(token));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [navigate]);

  // Keep a shareable plain anchor in the address (best effort; the viewer may ignore it).
  useEffect(() => {
    try {
      const token = toToken(location.pathname);
      window.history.replaceState(null, "", token ? `#${token}` : window.location.pathname);
    } catch {
      /* ignore */
    }
  }, [location.pathname]);

  const value = useMemo(() => ({ location, navigate, back, forward }), [location, navigate, back, forward]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouterContext() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("RouterProvider missing");
  return ctx;
}
