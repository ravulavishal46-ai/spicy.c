"use client";

import { defaultProfile } from "../data/account";
import { coupons } from "../data/coupons";
import { getDish } from "../data/menu";
import { COMBO_DISCOUNT, computeTotals, lineKey, lineUnitPrice } from "../pricing";
import type { Address, CartLine, Order, OrderStatus, PaymentMethod, SpiceLevel, User } from "../types";
import { uid } from "../utils";
import { createStore } from "./create-store";

/* ---------------------------------- Cart ---------------------------------- */

export const cartStore = createStore<CartLine[]>("cart", []);
export const couponStore = createStore<string | null>("coupon", null);
export const cartDrawerStore = createStore<boolean>("cart-open", false, { persist: false });

export const useCart = cartStore.useStore;
export const useCouponCode = couponStore.useStore;

export function useCartTotals() {
  const lines = useCart();
  const code = useCouponCode();
  return computeTotals(lines, coupons.find((c) => c.code === code));
}

export function openCart() {
  cartDrawerStore.set(true);
}
export function closeCart() {
  cartDrawerStore.set(false);
}

/* ------------------------------ Ordering gate ----------------------------- */

/** Only users who verified their email with a one-time code can order. */
export function canOrder() {
  return Boolean(userStore.get()?.verified);
}

export function useCanOrder() {
  return Boolean(useUser()?.verified);
}

/** Shown when someone who isn't verified tries to add to the bag or order. */
export const signInPromptStore = createStore<{ open: boolean; reason: string }>(
  "sign-in-prompt",
  { open: false, reason: "" },
  { persist: false },
);

export function requestEmailSignIn(reason = "add dishes to your bag") {
  closeCart();
  signInPromptStore.set({ open: true, reason });
}

/** Returns false (and asks the user to verify their email) when ordering isn't allowed. */
function ensureCanOrder(reason?: string) {
  if (canOrder()) return true;
  requestEmailSignIn(reason);
  return false;
}

export function addDishToCart(opts: {
  dishId: string;
  qty?: number;
  spice?: SpiceLevel;
  addOnIds?: string[];
  sizeId?: string | null;
  note?: string;
  silent?: boolean;
}): boolean {
  if (!ensureCanOrder()) return false;
  const dish = getDish(opts.dishId);
  if (!dish) return false;
  const spice = opts.spice ?? dish.spice;
  const addOnIds = opts.addOnIds ?? [];
  const sizeId = opts.sizeId ?? dish.sizes[0]?.id ?? null;
  const note = opts.note ?? "";
  const qty = opts.qty ?? 1;
  const key = lineKey(dish.id, spice, addOnIds, sizeId, note);
  cartStore.set((lines) => {
    const existing = lines.find((l) => l.key === key);
    if (existing) return lines.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
    return [...lines, { key, kind: "dish", dishId: dish.id, qty, spice, addOnIds, sizeId, note }];
  });
  if (!opts.silent) toast({ title: `${dish.name} added`, action: { label: "View cart", onClick: openCart } });
  return true;
}

export function addComboToCart(picks: { dishId: string; spice: SpiceLevel }[]): boolean {
  if (!ensureCanOrder("add a combo to your bag")) return false;
  const key = "combo|" + picks.map((p) => `${p.dishId}:${p.spice}`).join("+");
  cartStore.set((lines) => {
    const existing = lines.find((l) => l.key === key);
    if (existing) return lines.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
    return [...lines, { key, kind: "combo", qty: 1, picks, discountPct: COMBO_DISCOUNT }];
  });
  toast({ title: "Combo added to cart", action: { label: "View cart", onClick: openCart } });
  return true;
}

export function setLineQty(key: string, qty: number) {
  if (qty <= 0) return removeLine(key);
  cartStore.set((lines) => lines.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l)));
}

export function removeLine(key: string) {
  const prev = cartStore.get();
  const removed = prev.find((l) => l.key === key);
  cartStore.set(prev.filter((l) => l.key !== key));
  if (removed) {
    toast({
      title: "Removed from cart",
      action: { label: "Undo", onClick: () => cartStore.set((lines) => [...lines, removed]) },
    });
  }
}

export function clearCart() {
  cartStore.set([]);
  couponStore.set(null);
}

/** Validates and applies a coupon. Returns an error message, or null on success. */
export function applyCoupon(code: string): string | null {
  const normalised = code.trim().toUpperCase();
  if (!normalised) return "Enter a coupon code.";
  const coupon = coupons.find((c) => c.code === normalised);
  const totals = computeTotals(cartStore.get(), coupon);
  if (!coupon) return "That code doesn't exist. Check the spelling and try again.";
  if (totals.couponError) return totals.couponError;
  couponStore.set(normalised);
  toast({ title: `${normalised} applied`, tone: "success" });
  return null;
}

export function removeCoupon() {
  couponStore.set(null);
}

/* -------------------------------- Favorites ------------------------------- */

// Sample data shipped by earlier versions of the prototype; removed when found in saved data.
const LEGACY_ORDER_IDS = new Set(["SPC-48213", "SPC-47790", "SPC-46902", "SPC-46118", "SPC-45577"]);
const LEGACY_ADDRESS_IDS = new Set(["addr-home", "addr-work"]);
const LEGACY_FAVORITES = "the-scorcher,chili-oil-dumplings,ember-chicken-bowl,mango-lassi";

export const favoritesStore = createStore<string[]>("favorites", [], {
  migrate: (saved) => (saved.join(",") === LEGACY_FAVORITES ? [] : saved),
});
export const useFavorites = favoritesStore.useStore;

export function toggleFavorite(dishId: string) {
  const dish = getDish(dishId);
  const isFav = favoritesStore.get().includes(dishId);
  favoritesStore.set((ids) => (isFav ? ids.filter((id) => id !== dishId) : [...ids, dishId]));
  toast({ title: isFav ? `Removed ${dish?.name ?? "dish"} from favorites` : `Saved ${dish?.name ?? "dish"} to favorites` });
}

/* ------------------------------- Fake auth -------------------------------- */

export const userStore = createStore<User | null>("user", null, {
  // Sessions saved by an earlier version used a placeholder name; ask again instead.
  migrate: (saved) => (saved && saved.name.trim() && saved.name !== "Aarav Demo" ? saved : null),
});
export const useUser = userStore.useStore;

/** Email used by the browse-only demo sign-in. */
export const DEMO_EMAIL = "demo@spicy.test";

/* Each account (and the signed-out guest) keeps its own orders, favorites and
   addresses, so a brand-new user always starts at zero. */

interface AccountData {
  profile: User | null;
  orders: Order[];
  favorites: string[];
  addresses: Address[];
}

const GUEST = "guest";
export const accountsStore = createStore<Record<string, AccountData>>("accounts", {});

const accountKey = (u: { email: string } | null) => (u ? u.email.trim().toLowerCase() : GUEST);

function switchAccount(from: string, to: string) {
  if (from === to) return;
  // Save what's on screen for the account we're leaving…
  accountsStore.set((all) => ({
    ...all,
    [from]: { profile: userStore.get(), orders: ordersStore.get(), favorites: favoritesStore.get(), addresses: addressStore.get() },
  }));
  // …and load the account we're switching to (empty for a new user).
  const data = accountsStore.get()[to];
  ordersStore.set(data?.orders ?? []);
  favoritesStore.set(data?.favorites ?? []);
  addressStore.set(data?.addresses ?? []);
}

/**
 * Puts a user on screen and loads that account's orders, favorites and addresses.
 * Email accounts arrive here only after Supabase verified their one-time code
 * (see lib/auth.ts); the demo sign-in is browse-only (verified: false).
 */
export function signIn(user: Partial<User> & { name: string; email: string }) {
  const current = userStore.get();
  const key = accountKey(user);
  switchAccount(accountKey(current), key);
  const saved = key === accountKey(current) ? current : accountsStore.get()[key]?.profile;
  userStore.set({
    ...defaultProfile,
    memberSince: new Date().toISOString(),
    ...(saved ?? {}),
    ...user,
    name: user.name.trim(),
    verified: Boolean(user.verified),
  });
}

/** Clears the on-screen user without touching Supabase (see lib/auth.ts for full sign-out). */
export function signOutLocal() {
  switchAccount(accountKey(userStore.get()), GUEST);
  userStore.set(null);
  clearCart();
}

/* --------------------------------- Orders --------------------------------- */

export const ordersStore = createStore<Order[]>("orders", [], {
  migrate: (saved) => saved.filter((o) => !LEGACY_ORDER_IDS.has(o.id)),
});

/** Orders that count toward totals (cancelled orders are excluded). */
export function orderStats(orders: Order[]) {
  const counted = orders.filter((o) => o.status !== "cancelled");
  return { count: counted.length, spent: counted.reduce((sum, o) => sum + o.total, 0) };
}
export const useOrders = ordersStore.useStore;

export function placeOrder(input: {
  customerName: string;
  address: string;
  payment: PaymentMethod;
}): Order | null {
  if (!ensureCanOrder("place an order")) return null;
  const lines = cartStore.get();
  const code = couponStore.get();
  const totals = computeTotals(lines, coupons.find((c) => c.code === code));
  const items = lines.flatMap((line) => {
    if (line.kind === "combo") {
      return [
        {
          dishId: line.picks[0].dishId,
          name: "Build-Your-Combo: " + line.picks.map((p) => getDish(p.dishId)?.name).join(" + "),
          qty: line.qty,
          unitPrice: lineUnitPrice(line),
          spice: line.picks[0].spice,
          detail: `${line.discountPct}% combo saving`,
        },
      ];
    }
    const dish = getDish(line.dishId);
    if (!dish) return [];
    const size = dish.sizes.find((s) => s.id === line.sizeId);
    const addOns = dish.addOns.filter((a) => line.addOnIds.includes(a.id)).map((a) => a.name);
    return [
      {
        dishId: dish.id,
        name: dish.name,
        qty: line.qty,
        unitPrice: lineUnitPrice(line),
        spice: line.spice,
        detail: [size?.name, ...addOns].filter(Boolean).join(" · "),
      },
    ];
  });
  const newOrder: Order = {
    id: "SPC-" + Math.floor(50000 + Math.random() * 49999),
    createdAt: new Date().toISOString(),
    customerName: input.customerName,
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    delivery: totals.delivery,
    tax: totals.tax,
    total: totals.total,
    status: "placed",
    address: input.address,
    payment: input.payment,
    couponCode: totals.couponError ? null : code,
    live: true,
  };
  ordersStore.set((orders) => [newOrder, ...orders]);
  clearCart();
  return newOrder;
}

export function rateOrder(id: string, rating: number) {
  ordersStore.set((orders) => orders.map((o) => (o.id === id ? { ...o, rated: rating } : o)));
  toast({ title: "Thanks for rating your order!", tone: "success" });
}

/** Re-adds every item from a past order to the cart. */
export function reorder(order: Order) {
  if (!ensureCanOrder("reorder")) return;
  let added = 0;
  for (const item of order.items) {
    if (!getDish(item.dishId) || item.name.startsWith("Build-Your-Combo")) continue;
    addDishToCart({ dishId: item.dishId, qty: item.qty, spice: item.spice, silent: true });
    added += item.qty;
  }
  toast({
    title: added ? `${added} items from ${order.id} added` : "Those items are no longer available",
    tone: added ? "success" : "error",
    action: added ? { label: "View cart", onClick: openCart } : undefined,
  });
}

export const TRACKING_STAGES: { status: OrderStatus; label: string; detail: string; at: number }[] = [
  { status: "placed", label: "Order placed", detail: "We've received your order.", at: 0 },
  { status: "preparing", label: "Cooking", detail: "The wok is fired up and your food is on the flame.", at: 8 },
  { status: "packed", label: "Packed", detail: "Sealed hot and checked at the pass.", at: 20 },
  { status: "on-the-way", label: "On the way", detail: "Your rider is heading over.", at: 30 },
  { status: "delivered", label: "Delivered", detail: "Enjoy! Don't forget to rate your meal.", at: 50 },
];

/** For simulated live orders, the status advances on a short demo timeline (seconds). */
export function liveStatus(order: Order, now: number): { status: OrderStatus; progress: number } {
  if (!order.live || order.status === "cancelled") {
    const idx = TRACKING_STAGES.findIndex((s) => s.status === order.status);
    return { status: order.status, progress: order.status === "cancelled" ? 0 : idx / (TRACKING_STAGES.length - 1) };
  }
  const elapsed = Math.max(0, (now - new Date(order.createdAt).getTime()) / 1000);
  const last = TRACKING_STAGES[TRACKING_STAGES.length - 1].at;
  let current = TRACKING_STAGES[0];
  for (const s of TRACKING_STAGES) if (elapsed >= s.at) current = s;
  return { status: current.status, progress: Math.min(1, elapsed / last) };
}

export function restartTrackingDemo(id: string) {
  ordersStore.set((orders) =>
    orders.map((o) => (o.id === id ? { ...o, live: true, status: "placed", createdAt: new Date().toISOString() } : o)),
  );
}

export function cancelOrder(id: string) {
  ordersStore.set((orders) => orders.map((o) => (o.id === id ? { ...o, status: "cancelled", live: false } : o)));
  toast({ title: `Order ${id} cancelled`, tone: "error" });
}

/* -------------------------------- Addresses ------------------------------- */

export const addressStore = createStore<Address[]>("addresses", [], {
  migrate: (saved) => saved.filter((a) => !LEGACY_ADDRESS_IDS.has(a.id)),
});
export const useAddresses = addressStore.useStore;

export function saveAddress(address: Omit<Address, "id"> & { id?: string }) {
  const id = address.id ?? uid("addr-");
  addressStore.set((list) => {
    let next = list.some((a) => a.id === id)
      ? list.map((a) => (a.id === id ? { ...address, id } : a))
      : [...list, { ...address, id }];
    if (address.isDefault) next = next.map((a) => ({ ...a, isDefault: a.id === id }));
    if (!next.some((a) => a.isDefault) && next[0]) next[0] = { ...next[0], isDefault: true };
    return next;
  });
  toast({ title: "Address saved", tone: "success" });
}

export function deleteAddress(id: string) {
  addressStore.set((list) => {
    const next = list.filter((a) => a.id !== id);
    if (next.length && !next.some((a) => a.isDefault)) next[0] = { ...next[0], isDefault: true };
    return next;
  });
  toast({ title: "Address removed" });
}

/* --------------------------------- Toasts --------------------------------- */

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "error";
  action?: { label: string; onClick: () => void };
}

export const toastStore = createStore<Toast[]>("toasts", [], { persist: false });
export const useToasts = toastStore.useStore;

export function toast(t: Omit<Toast, "id">) {
  const id = uid("t-");
  toastStore.set((list) => [...list.slice(-2), { ...t, id }]);
  setTimeout(() => dismissToast(id), 4500);
}

export function dismissToast(id: string) {
  toastStore.set((list) => list.filter((t) => t.id !== id));
}
