import { demoReviews } from "../data/account";
import { coupons as baseCoupons } from "../data/coupons";
import { categories as baseCategories, dishes as baseDishes } from "../data/menu";
import type { Category, Coupon, Dish, OrderStatus, PaymentMethod, Review } from "../types";

/* Deterministic pseudo-random numbers so server and browser render the same mock data. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** "Now" for the admin demo — fixed so charts and tables are stable. */
export const ADMIN_NOW = new Date("2026-10-13T20:30:00+05:30").getTime();

const firstNames = ["Aanya", "Kabir", "Ishita", "Vihaan", "Diya", "Arjun", "Myra", "Reyansh", "Anika", "Advait", "Saanvi", "Ayaan", "Kiara", "Dhruv", "Tara", "Neel", "Zoya", "Rohan", "Meher", "Yash", "Inaya", "Kian", "Riya", "Om"];
const lastInitials = ["S", "K", "R", "M", "P", "D", "T", "V", "N", "G", "B", "J"];

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  orders: number;
  spent: number;
  lastOrder: string;
  heat: number;
  status: "active" | "blocked";
}

export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  items: { dishId: string; name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  channel: "app" | "web";
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  par: number;
  supplier: string;
  costPerUnit: number;
  updatedAt: string;
}

export interface AdminDish extends Dish {
  available: boolean;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  area: "orders" | "menu" | "categories" | "customers" | "coupons" | "inventory" | "reviews" | "settings";
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  opensAt: string;
  closesAt: string;
  deliveryFee: number;
  freeDeliveryOver: number;
  prepBufferMinutes: number;
  acceptingOrders: boolean;
  autoAcceptOrders: boolean;
  showSpiceWarnings: boolean;
}

export function makeCustomers(): AdminCustomer[] {
  const r = rng(7);
  return firstNames.map((first, i) => {
    const name = `${first} ${lastInitials[i % lastInitials.length]}.`;
    const orders = Math.floor(r() * 38) + (i < 4 ? 20 : 0);
    const avg = 380 + Math.floor(r() * 420);
    const joined = new Date(ADMIN_NOW - (30 + Math.floor(r() * 600)) * 86400000).toISOString();
    const last = new Date(ADMIN_NOW - Math.floor(r() * (i % 5 === 4 ? 90 : 20)) * 86400000 - Math.floor(r() * 86400000)).toISOString();
    return {
      id: `CUS-${1001 + i}`,
      name,
      email: `${first.toLowerCase()}.${lastInitials[i % lastInitials.length].toLowerCase()}@example.test`,
      phone: `+91 9${String(100000000 + Math.floor(r() * 899999999)).slice(0, 9)}`,
      joined,
      orders,
      spent: orders * avg,
      lastOrder: last,
      heat: 1 + Math.floor(r() * 5),
      status: i === 17 ? "blocked" : "active",
    };
  });
}

const statuses: OrderStatus[] = ["placed", "preparing", "packed", "on-the-way"];

export function makeOrders(customers: AdminCustomer[]): AdminOrder[] {
  const r = rng(42);
  const orders: AdminOrder[] = [];
  for (let i = 0; i < 64; i++) {
    const c = customers[Math.floor(r() * customers.length)];
    const itemCount = 1 + Math.floor(r() * 3);
    const items = Array.from({ length: itemCount }, () => {
      const d = baseDishes[Math.floor(r() * baseDishes.length)];
      return { dishId: d.id, name: d.name, qty: 1 + Math.floor(r() * 2), price: d.price };
    });
    const minutesAgo = i < 7 ? i * 6 + Math.floor(r() * 5) : 45 + i * 70 + Math.floor(r() * 60);
    const total = Math.round(items.reduce((s, it) => s + it.price * it.qty, 0) * 1.05);
    let status: OrderStatus = "delivered";
    if (i < 7) status = statuses[Math.min(3, Math.floor(i / 2))];
    else if (r() < 0.07) status = "cancelled";
    orders.push({
      id: `SPC-${48300 - i * 7}`,
      customerId: c.id,
      customerName: c.name,
      createdAt: new Date(ADMIN_NOW - minutesAgo * 60000).toISOString(),
      items,
      total,
      status,
      payment: (["upi", "card", "cod"] as const)[Math.floor(r() * 3)],
      channel: r() < 0.68 ? "app" : "web",
    });
  }
  return orders;
}

export function makeInventory(): InventoryItem[] {
  const rows: [string, string, number, number, string, number][] = [
    ["Chicken thigh", "kg", 42, 60, "Fresh Farm Co. (demo)", 290],
    ["Beef mince", "kg", 18, 30, "Prime Cuts Ltd. (demo)", 520],
    ["Paneer", "kg", 6, 20, "Dairy Fields (demo)", 380],
    ["Basmati rice", "kg", 120, 100, "Grain House (demo)", 110],
    ["Corn tortillas", "packs", 9, 40, "Masa Works (demo)", 85],
    ["Ghost-pepper jack", "kg", 3, 8, "Cheese Lab (demo)", 1450],
    ["Gochujang", "kg", 14, 10, "Seoul Pantry (demo)", 640],
    ["Dried chilies (mixed)", "kg", 22, 15, "Spice Route (demo)", 420],
    ["Carolina Reaper mash", "jars", 2, 6, "Hot Stuff Co. (demo)", 980],
    ["Wheat noodles", "kg", 35, 30, "Noodle Bros (demo)", 140],
    ["Prawns", "kg", 4, 12, "Coastline Seafood (demo)", 780],
    ["Brioche buns", "pcs", 160, 200, "Bake House (demo)", 18],
    ["Alphonso mango pulp", "L", 11, 15, "Orchard Fresh (demo)", 260],
    ["Cooking oil", "L", 80, 60, "Oil Depot (demo)", 150],
    ["Dark chocolate 70%", "kg", 5, 6, "Cocoa Co. (demo)", 1200],
    ["Fresh herbs (mixed)", "kg", 1.5, 5, "Green Grocer (demo)", 300],
  ];
  return rows.map(([name, unit, stock, par, supplier, cost], i) => ({
    id: `INV-${200 + i}`,
    name,
    unit,
    stock,
    par,
    supplier,
    costPerUnit: cost,
    updatedAt: new Date(ADMIN_NOW - (i * 5 + 3) * 3600000).toISOString(),
  }));
}

export function makeDishes(): AdminDish[] {
  return baseDishes.map((d) => ({ ...d, available: d.id !== "carolina-reaper-challenge-wings" }));
}

export function makeCategories(): Category[] {
  return baseCategories.map((c) => ({ ...c }));
}

export function makeCoupons(): Coupon[] {
  return baseCoupons.map((c) => ({ ...c }));
}

export function makeReviews(): Review[] {
  return demoReviews.map((r) => ({ ...r }));
}

export function makeAudit(): AuditEvent[] {
  const rows: Omit<AuditEvent, "id" | "at">[] = [
    { actor: "Priya (demo manager)", action: "Updated price", target: "Smoked Butter Chicken", detail: "₹369 → ₹379", area: "menu" },
    { actor: "System", action: "Low stock alert", target: "Carolina Reaper mash", detail: "2 jars left (par 6)", area: "inventory" },
    { actor: "Sam (demo staff)", action: "Marked unavailable", target: "Carolina Reaper Challenge Wings", detail: "Out of reaper mash", area: "menu" },
    { actor: "Priya (demo manager)", action: "Created coupon", target: "INFERNO50", detail: "50% off, max ₹250", area: "coupons" },
    { actor: "Priya (demo manager)", action: "Replied to review", target: "rv-1", detail: "The Scorcher", area: "reviews" },
    { actor: "System", action: "Coupon expired", target: "MONSOON15", detail: "Auto-deactivated", area: "coupons" },
    { actor: "Sam (demo staff)", action: "Cancelled order", target: "SPC-47581", detail: "Customer request", area: "orders" },
    { actor: "Priya (demo manager)", action: "Blocked customer", target: "CUS-1018", detail: "Repeated chargebacks (demo)", area: "customers" },
    { actor: "Priya (demo manager)", action: "Changed setting", target: "Free delivery threshold", detail: "₹499 → ₹599", area: "settings" },
  ];
  return rows.map((row, i) => ({ ...row, id: `AUD-${900 - i}`, at: new Date(ADMIN_NOW - (i * 3 + 1) * 3600000 - i * 997000).toISOString() }));
}

export const defaultSettings: StoreSettings = {
  storeName: "SPICY — Banjara Hills (demo)",
  phone: "+91 00000 00000",
  opensAt: "11:00",
  closesAt: "02:00",
  deliveryFee: 49,
  freeDeliveryOver: 599,
  prepBufferMinutes: 5,
  acceptingOrders: true,
  autoAcceptOrders: false,
  showSpiceWarnings: true,
};

/** Daily revenue/order series for analytics (deterministic). */
export function dailySeries(days: number) {
  const r = rng(days * 13 + 5);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(ADMIN_NOW - (days - 1 - i) * 86400000);
    const weekday = date.getUTCDay();
    const weekend = weekday === 0 || weekday === 5 || weekday === 6;
    const trend = 1 + (i / days) * 0.18;
    const orders = Math.round((weekend ? 142 : 104) * trend * (0.85 + r() * 0.3));
    const aov = 470 + Math.round(r() * 90);
    return { date: date.toISOString(), orders, revenue: orders * aov };
  });
}

export const ordersByHour = [
  { hour: "11a", orders: 18 }, { hour: "12p", orders: 46 }, { hour: "1p", orders: 71 }, { hour: "2p", orders: 52 },
  { hour: "3p", orders: 21 }, { hour: "4p", orders: 16 }, { hour: "5p", orders: 24 }, { hour: "6p", orders: 39 },
  { hour: "7p", orders: 78 }, { hour: "8p", orders: 112 }, { hour: "9p", orders: 104 }, { hour: "10p", orders: 81 },
  { hour: "11p", orders: 57 }, { hour: "12a", orders: 38 }, { hour: "1a", orders: 19 },
];
