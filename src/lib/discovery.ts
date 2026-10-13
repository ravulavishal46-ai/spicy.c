import { dishes, getDish } from "./data/menu";
import type { Dish, Order, SpiceLevel } from "./types";

/** Most frequently ordered dishes across delivered orders (Smart Reorder). */
export function frequentItems(orders: Order[], limit = 3) {
  const counts = new Map<string, { qty: number; spice: SpiceLevel; lastOrdered: string; times: number }>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      if (!getDish(item.dishId) || item.name.startsWith("Build-Your-Combo")) continue;
      const prev = counts.get(item.dishId);
      counts.set(item.dishId, {
        qty: (prev?.qty ?? 0) + item.qty,
        times: (prev?.times ?? 0) + 1,
        spice: prev?.spice ?? item.spice,
        lastOrdered: prev && prev.lastOrdered > order.createdAt ? prev.lastOrdered : order.createdAt,
      });
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].times - a[1].times || b[1].qty - a[1].qty)
    .slice(0, limit)
    .map(([dishId, info]) => ({ dish: getDish(dishId)!, ...info }));
}

/**
 * Personalised discovery: scores dishes by flavour-profile overlap with the
 * user's favorites and past orders, nudged toward their preferred heat.
 */
export function recommend(favoriteIds: string[], orders: Order[], heat: SpiceLevel, limit = 4) {
  const tasteIds = new Set([...favoriteIds, ...orders.flatMap((o) => o.items.map((i) => i.dishId))]);
  const tagWeights = new Map<string, number>();
  for (const id of tasteIds) {
    for (const tag of getDish(id)?.profile ?? []) tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + 1);
  }
  const topTag = [...tagWeights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const scored = dishes
    .filter((d) => !tasteIds.has(d.id) && d.category !== "coolers")
    .map((d) => {
      const tagScore = d.profile.reduce((s, t) => s + (tagWeights.get(t) ?? 0), 0);
      const heatScore = 2 - Math.abs(d.spice - heat) * 0.8;
      return { dish: d, score: tagScore + heatScore + d.rating / 5 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.dish);
  return { dishes: scored, topTag };
}

export function popular(limit = 4): Dish[] {
  return [...dishes].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
}

export const tagLabels: Record<string, string> = {
  korean: "Korean heat",
  smoky: "smoky flavours",
  chicken: "chicken dishes",
  indian: "Indian classics",
  american: "American comfort",
  mexican: "Mexican street food",
  chinese: "Sichuan-style heat",
  numbing: "numbing Sichuan pepper",
  cheesy: "anything cheesy",
  crispy: "crispy things",
  veg: "vegetarian dishes",
  beef: "smash burgers",
  pork: "pork dishes",
  thai: "Thai flavours",
  peppery: "peppery curries",
  aromatic: "aromatic rice",
  creamy: "creamy curries",
  herby: "fresh herbs",
  sticky: "sticky glazes",
};
