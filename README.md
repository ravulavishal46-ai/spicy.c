# SPICY — Turn Up the Taste 🌶️

A premium food-ordering and restaurant-management **frontend prototype**, built with
Next.js (App Router), React, TypeScript and Tailwind CSS.

> **Prototype notice.** Everything here is simulated. Dishes, customers, orders, reviews
> and payments are fictional mock data stored in your browser (`localStorage`).
> There is **no real authentication, payment processing, database or API**.
> The `/admin` area is **not secured** — it has no sign-in and no server-side
> authorization, and must not be deployed publicly as-is.

---

## Run it on Windows 11 (step by step)

1. **Install Node.js** (one-time): download the **LTS** installer from
   <https://nodejs.org> and run it with the default options.
2. **Open the project folder** in a terminal. In File Explorer, open the `spicy.c`
   folder, click the address bar, type `powershell` and press **Enter**.
3. **Install dependencies** (one-time, takes a minute):
   ```powershell
   npm install
   ```
4. **Start the app:**
   ```powershell
   npm run dev
   ```
5. Open <http://localhost:3000> in your browser. Press **Ctrl + C** in the terminal to stop.

Useful extras:

| Command | What it does |
| --- | --- |
| `npm run build` then `npm start` | Production build, then serve it on port 3000 |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run check` | Typecheck + lint + build in one go |

> Food photos are saved in `public/images` (sources in `public/images/CREDITS.md`), so they work offline.
> To use your own photos, replace a file there and keep the same name.
> If a photo is ever missing, a designed placeholder appears instead.

---

## Things to try

| Where | Try this |
| --- | --- |
| `/` | Drag the **Spice Meter** in “How hot do you really like it?” |
| `/menu` | Search “chili”, filter by heat or diet, change the sort |
| `/food/the-scorcher` | Use ←/→ keys on the Spice Meter, add-ons, kitchen note |
| `/combo` | Build a main + side + cooler combo (15% off) |
| Cart drawer | Change quantities, apply `HEAT20`, try a bad code |
| `/checkout` | Submit empty to see validation; card `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined |
| After checkout | Watch the order move through each stage (≈1 minute); “Replay tracking demo” restarts it |
| `/login` | Enter your name, then “Quick demo sign-in” — your name appears on your profile; unlocks Smart Reorder and personalised picks |
| `/menu?simulate=error` | See the error state |
| `/admin` | Advance orders, edit dishes, restock inventory, moderate reviews — all logged in **Settings → Audit activity** |

Each signed-in account (by email) keeps its own orders, favorites and addresses — a new user starts at zero, and the profile’s Orders, Favorites and Spent figures are calculated from that account’s own orders (cancelled orders excluded).

All data is kept in your browser; clearing your browser's site data starts everything fresh.

---

## Design system

| Token | Hex | Use |
| --- | --- | --- |
| Charcoal | `#141414` | Primary text, dark sections |
| Chili Red | `#E63920` | Brand accent, decorative and large type |
| Chili Strong | `#D9361D` | Buttons with white text (4.67:1 contrast) |
| Chili Deep | `#C42E17` | Small red text on cream (5.3:1) |
| Saffron | `#FFB547` | Highlights, ratings — always with charcoal text |
| Cream | `#FFF7ED` | Page background |
| White | `#FFFFFF` | Cards |

Typography: **Fraunces** (display), **Inter Tight** (UI), **JetBrains Mono** (codes & numbers).
Motion respects `prefers-reduced-motion`.

---

## Project structure

```
src/
├─ app/
│  ├─ (shop)/        Storefront: landing, menu, food, combo, cart, checkout,
│  │                 offers, support, account (profile, orders, tracking,
│  │                 favorites, addresses)
│  ├─ (auth)/        Login & register
│  └─ admin/         Admin prototype (overview, orders, menu, categories,
│                    customers, coupons, inventory, reviews, analytics, settings)
├─ components/
│  ├─ ui/            Buttons, fields, dialogs/drawers, toasts, images, badges…
│  ├─ shop/          Spice Meter, food card, cart drawer, combo builder, checkout…
│  ├─ home/          Landing page sections
│  ├─ account/       Customer dashboard pages and order tracker
│  ├─ auth/          Login & registration forms
│  ├─ admin/         Admin shell, data table, SVG charts, admin pages
│  └─ layout/        Header & footer
└─ lib/
   ├─ data/          Fictional menu, coupons, account and review data
   ├─ admin/         Admin mock data generators and stores
   ├─ store/         Tiny persisted stores (cart, favorites, fake auth, orders…)
   ├─ pricing.ts     Cart totals, coupons, combo pricing
   ├─ discovery.ts   Smart Reorder + personalised recommendations
   └─ validation.ts  Form validators
```

## Before this becomes a real product

- Add real authentication and **server-side authorization** for every `/admin` page
  and every data mutation (UI checks alone are not security).
- Replace `localStorage` stores with a database and API.
- Integrate a real payment provider; never handle raw card numbers yourself.
- Wire the admin menu/coupon edits to the storefront data source.
