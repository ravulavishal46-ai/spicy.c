"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny persisted store built on useSyncExternalStore.
 * The server (and the first hydration pass) always sees `initial`, so markup
 * matches; the browser then switches to whatever is saved in localStorage.
 * This is mock persistence for the prototype — there is no backend.
 */
export function createStore<T>(key: string, initial: T, options: { persist?: boolean } = {}) {
  const persist = options.persist ?? true;
  const storageKey = `spicy:${key}`;
  let state: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    if (!persist) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      // Corrupt or unavailable storage: fall back to the initial value.
    }
  }

  function get(): T {
    load();
    return state;
  }

  function set(next: T | ((prev: T) => T)) {
    load();
    state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
    if (persist) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Ignore quota / private-mode errors.
      }
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function reset() {
    set(initial);
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, get, () => initial);
  }

  return { get, set, subscribe, reset, useStore };
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. Use it to avoid flashing logged-out UI. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
