import type { Review, User } from "../types";

/** Profile defaults for a simulated sign-in. The name always comes from the user. */
export const defaultProfile: Omit<User, "name" | "email"> = {
  phone: "",
  memberSince: "2025-03-14",
  heatPreference: 3,
};

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
