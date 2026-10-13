import type { Address, Order, Review, User } from "../types";

/** Profile defaults for a simulated sign-in. The name always comes from the user. */
export const defaultProfile: Omit<User, "name" | "email"> = {
  phone: "",
  memberSince: "2025-03-14",
  heatPreference: 3,
};

/** Email used by the "quick demo sign-in" button. */
export const DEMO_EMAIL = "demo@spicy.test";

export const demoAddresses: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    line1: "Flat 12B, Saffron Residency",
    line2: "Example Street, Demo Nagar",
    city: "Hyderabad",
    pincode: "500001",
    phone: "+91 90000 00000",
    isDefault: true,
  },
  {
    id: "addr-work",
    label: "Work",
    line1: "Floor 4, Fictional Tech Park",
    line2: "Sample Road, Test Layout",
    city: "Hyderabad",
    pincode: "500081",
    phone: "+91 90000 00000",
    isDefault: false,
  },
];

function order(
  id: string,
  createdAt: string,
  items: Order["items"],
  status: Order["status"],
  extra: Partial<Order> = {},
): Order {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discount = extra.discount ?? 0;
  const delivery = subtotal >= 599 ? 0 : 49;
  const tax = Math.round((subtotal - discount) * 0.05);
  return {
    id,
    createdAt,
    customerName: "You",
    items,
    subtotal,
    discount,
    delivery,
    tax,
    total: subtotal - discount + delivery + tax,
    status,
    address: "Flat 12B, Saffron Residency, Hyderabad 500001",
    payment: "upi",
    couponCode: null,
    live: false,
    ...extra,
  };
}

export const demoOrders: Order[] = [
  order(
    "SPC-48213",
    "2026-10-10T19:42:00+05:30",
    [
      { dishId: "the-scorcher", name: "The Scorcher", qty: 1, unitPrice: 389, spice: 5, detail: "Extra cheese" },
      { dishId: "masala-loaded-fries", name: "Masala Loaded Fries", qty: 1, unitPrice: 179, spice: 2, detail: "" },
      { dishId: "mango-lassi", name: "Mango Lassi", qty: 2, unitPrice: 129, spice: 1, detail: "Glass" },
    ],
    "delivered",
    { rated: 5 },
  ),
  order(
    "SPC-47790",
    "2026-10-04T13:15:00+05:30",
    [
      { dishId: "hyderabadi-dum-biryani", name: "Hyderabadi Dum Biryani", qty: 2, unitPrice: 399, spice: 3, detail: "Regular" },
      { dishId: "chili-cheese-samosas", name: "Chili Cheese Samosas", qty: 1, unitPrice: 149, spice: 2, detail: "" },
    ],
    "delivered",
    { discount: 150, couponCode: "HEAT20" },
  ),
  order(
    "SPC-46902",
    "2026-09-27T20:05:00+05:30",
    [
      { dishId: "ember-chicken-bowl", name: "Ember Chicken Bowl", qty: 1, unitPrice: 349, spice: 4, detail: "Regular · Jammy soft egg" },
      { dishId: "chili-oil-dumplings", name: "Chili Oil Dumplings", qty: 1, unitPrice: 289, spice: 3, detail: "" },
    ],
    "delivered",
    { payment: "card" },
  ),
  order(
    "SPC-46118",
    "2026-09-18T21:30:00+05:30",
    [
      { dishId: "the-scorcher", name: "The Scorcher", qty: 2, unitPrice: 389, spice: 5, detail: "" },
      { dishId: "buffalo-blaze-wings", name: "Buffalo Blaze Wings", qty: 1, unitPrice: 329, spice: 3, detail: "6 pieces" },
    ],
    "delivered",
  ),
  order(
    "SPC-45577",
    "2026-09-09T12:50:00+05:30",
    [{ dishId: "smoked-butter-chicken", name: "Smoked Butter Chicken", qty: 1, unitPrice: 379, spice: 2, detail: "Regular" }],
    "cancelled",
    { payment: "cod" },
  ),
];

export const demoReviews: Review[] = [
  {
    id: "rv-1",
    dishId: "the-scorcher",
    author: "Meera K. (demo)",
    rating: 5,
    title: "Lives up to the name",
    body: "The ghost-pepper cheese is no joke, but there's real flavour underneath the heat. Crispy edges on the patties were perfect.",
    date: "2026-10-08",
    status: "published",
    reply: "Thank you, Meera! The Wall of Flame salutes you.",
  },
  {
    id: "rv-2",
    dishId: "hyderabadi-dum-biryani",
    author: "Rohan P. (demo)",
    rating: 5,
    title: "Best biryani I've had delivered",
    body: "Rice was fluffy and separate, the salan was spot on. Arrived hot.",
    date: "2026-10-05",
    status: "published",
  },
  {
    id: "rv-3",
    dishId: "chili-oil-dumplings",
    author: "Sana I. (demo)",
    rating: 4,
    title: "Addictive chili oil",
    body: "Would happily drink the chili oil. Only wish there were ten dumplings instead of eight!",
    date: "2026-10-02",
    status: "published",
  },
  {
    id: "rv-4",
    dishId: "carolina-reaper-challenge-wings",
    author: "Dev T. (demo)",
    rating: 3,
    title: "Hot. Very hot.",
    body: "I finished four. The mango is a nice touch but my tongue has filed a complaint.",
    date: "2026-09-29",
    status: "published",
  },
  {
    id: "rv-5",
    dishId: "ember-chicken-bowl",
    author: "Kavya R. (demo)",
    rating: 5,
    title: "My weekly order",
    body: "Smoky, crunchy, perfectly balanced. Level 4 is my sweet spot.",
    date: "2026-09-25",
    status: "published",
  },
  {
    id: "rv-6",
    dishId: "masala-loaded-fries",
    author: "Arjun S. (demo)",
    rating: 2,
    title: "Fries were soggy",
    body: "Flavour was great but they arrived a bit soggy under the cheese sauce.",
    date: "2026-10-11",
    status: "pending",
  },
  {
    id: "rv-7",
    dishId: "smoked-butter-chicken",
    author: "Nisha V. (demo)",
    rating: 5,
    title: "Silky and smoky",
    body: "The dhungar smoke really comes through. Paired with parotta it's unbeatable.",
    date: "2026-10-12",
    status: "pending",
  },
];

export const faqs = [
  {
    q: "How does the Spice Meter work?",
    a: "Every dish has a house heat level. On most dishes you can dial it from 1 (Mild) to 5 (Inferno) before adding to cart — the kitchen adjusts the chili for you.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders arrive in 30–40 minutes. You can follow every step live on the order tracking page.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "You can cancel within 60 seconds of placing an order. After the kitchen starts cooking, contact support and we'll do our best.",
  },
  {
    q: "Do you label allergens?",
    a: "Yes. Every dish lists its main ingredients and diet tags (veg, vegan, gluten-free, contains nuts). Add a kitchen note for anything else.",
  },
  {
    q: "Is this a real restaurant?",
    a: "No — SPICY is a design prototype. All dishes, orders, customers and payments are simulated demo data.",
  },
];
