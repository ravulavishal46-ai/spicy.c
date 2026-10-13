import { getDish } from "./data/menu";
import type { CartLine, Coupon, DishLine, SpiceLevel } from "./types";

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_OVER = 599;
export const TAX_RATE = 0.05;
export const COMBO_DISCOUNT = 15;

export function dishLineUnitPrice(line: Pick<DishLine, "dishId" | "addOnIds" | "sizeId">) {
  const dish = getDish(line.dishId);
  if (!dish) return 0;
  const size = dish.sizes.find((s) => s.id === line.sizeId);
  const addOns = dish.addOns.filter((a) => line.addOnIds.includes(a.id));
  return dish.price + (size?.priceDelta ?? 0) + addOns.reduce((sum, a) => sum + a.price, 0);
}

export function comboPrice(picks: { dishId: string }[], discountPct = COMBO_DISCOUNT) {
  const full = picks.reduce((sum, p) => sum + (getDish(p.dishId)?.price ?? 0), 0);
  return { full, price: Math.round(full * (1 - discountPct / 100)), saved: Math.round((full * discountPct) / 100) };
}

export function lineUnitPrice(line: CartLine) {
  return line.kind === "dish" ? dishLineUnitPrice(line) : comboPrice(line.picks, line.discountPct).price;
}

export function lineKey(dishId: string, spice: SpiceLevel, addOnIds: string[], sizeId: string | null, note = "") {
  return [dishId, spice, [...addOnIds].sort().join("+"), sizeId ?? "-", note.trim().toLowerCase()].join("|");
}

export type CouponCheck = { ok: true; discount: number; freeDelivery: boolean } | { ok: false; reason: string };

export function evaluateCoupon(coupon: Coupon | undefined, subtotal: number): CouponCheck {
  if (!coupon) return { ok: false, reason: "That code doesn't exist. Check the spelling and try again." };
  if (!coupon.active) return { ok: false, reason: "This offer has expired." };
  if (subtotal < coupon.minSubtotal)
    return { ok: false, reason: `Add ₹${coupon.minSubtotal - subtotal} more to use ${coupon.code}.` };
  if (coupon.kind === "free-delivery") return { ok: true, discount: 0, freeDelivery: true };
  const raw = coupon.kind === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  const discount = Math.round(Math.min(raw, coupon.maxDiscount ?? Infinity, subtotal));
  return { ok: true, discount, freeDelivery: false };
}

export interface Totals {
  itemCount: number;
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  couponError: string | null;
  toFreeDelivery: number;
}

export function computeTotals(lines: CartLine[], coupon: Coupon | undefined): Totals {
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + lineUnitPrice(l) * l.qty, 0);
  let discount = 0;
  let freeDelivery = subtotal >= FREE_DELIVERY_OVER;
  let couponError: string | null = null;
  if (coupon) {
    const check = evaluateCoupon(coupon, subtotal);
    if (check.ok) {
      discount = check.discount;
      freeDelivery = freeDelivery || check.freeDelivery;
    } else {
      couponError = check.reason;
    }
  }
  const delivery = subtotal === 0 || freeDelivery ? 0 : DELIVERY_FEE;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  return {
    itemCount,
    subtotal,
    discount,
    delivery,
    tax,
    total: subtotal - discount + delivery + tax,
    couponError,
    toFreeDelivery: Math.max(0, FREE_DELIVERY_OVER - subtotal),
  };
}
