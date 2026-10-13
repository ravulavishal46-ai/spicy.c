"use client";

import { createStore } from "../store/create-store";
import { toast } from "../store";
import { uid } from "../utils";
import {
  type AuditEvent,
  defaultSettings,
  makeAudit,
  makeCategories,
  makeCoupons,
  makeCustomers,
  makeDishes,
  makeInventory,
  makeOrders,
  makeReviews,
} from "./data";

/* Admin prototype state — mock data persisted in this browser only. */

const customers = makeCustomers();

export const adminOrders = createStore("admin:orders", makeOrders(customers));
export const adminDishes = createStore("admin:dishes", makeDishes());
export const adminCategories = createStore("admin:categories", makeCategories());
export const adminCustomers = createStore("admin:customers", customers);
export const adminCoupons = createStore("admin:coupons", makeCoupons());
export const adminInventory = createStore("admin:inventory", makeInventory());
export const adminReviews = createStore("admin:reviews", makeReviews());
export const adminAudit = createStore("admin:audit", makeAudit());
export const adminSettings = createStore("admin:settings", defaultSettings);

export const ADMIN_ACTOR = "You (demo admin)";

export function audit(area: AuditEvent["area"], action: string, target: string, detail = "") {
  adminAudit.set((list) => [
    { id: uid("AUD-"), at: new Date().toISOString(), actor: ADMIN_ACTOR, action, target, detail, area },
    ...list,
  ]);
}

/** Records an audit event and shows a toast in one step. */
export function done(area: AuditEvent["area"], action: string, target: string, detail = "", undo?: () => void) {
  audit(area, action, target, detail);
  toast({
    title: `${action}: ${target}`,
    description: detail || undefined,
    tone: "success",
    action: undo ? { label: "Undo", onClick: () => { undo(); audit(area, `Undid "${action}"`, target); } } : undefined,
  });
}

export type StockLevel = "ok" | "low" | "critical";

export function stockLevel(stock: number, par: number): StockLevel {
  const ratio = stock / par;
  return ratio < 0.3 ? "critical" : ratio < 0.7 ? "low" : "ok";
}
