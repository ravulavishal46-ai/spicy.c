"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FoodImage } from "@/components/ui/food-image";
import { SpiceMeter, SpiceDots } from "@/components/shop/spice-meter";
import type { AdminDish } from "@/lib/admin/data";
import { adminCategories, adminDishes, done } from "@/lib/admin/store";
import { photos } from "@/lib/data/images";
import type { Badge as BadgeT, SpiceLevel } from "@/lib/types";
import { money } from "@/lib/utils";
import { AdminPageHeader } from "./admin-shell";
import { FilterTabs, Toggle } from "./bits";
import { type Column, DataTable } from "./data-table";

const badgeOptions: { id: BadgeT; label: string }[] = [
  { id: "bestseller", label: "Bestseller" },
  { id: "new", label: "New" },
  { id: "chef-pick", label: "Chef's pick" },
  { id: "limited", label: "Limited" },
];

export function MenuAdmin() {
  const dishes = adminDishes.useStore();
  const categories = adminCategories.useStore();
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<AdminDish | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminDish | null>(null);

  const rows = category === "all" ? dishes : dishes.filter((d) => d.category === category);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "Uncategorised";

  function toggleAvailable(d: AdminDish) {
    adminDishes.set((list) => list.map((x) => (x.id === d.id ? { ...x, available: !x.available } : x)));
    done("menu", d.available ? "Marked unavailable" : "Marked available", d.name);
  }

  const columns: Column<AdminDish>[] = [
    {
      key: "name",
      header: "Dish",
      sortValue: (d) => d.name,
      cell: (d) => (
        <div className="flex items-center gap-3">
          <FoodImage src={d.image} alt="" label={d.name} className="h-11 w-11 shrink-0 rounded-xl" sizes="44px" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{d.name}</p>
            <p className="truncate text-xs text-ash">{d.short}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", sortValue: (d) => catName(d.category), cell: (d) => catName(d.category), hideOnMobile: true },
    { key: "price", header: "Price", align: "right", sortValue: (d) => d.price, cell: (d) => <span className="font-semibold">{money(d.price)}</span> },
    { key: "spice", header: "Heat", sortValue: (d) => d.spice, cell: (d) => <SpiceDots level={d.spice} />, hideOnMobile: true },
    { key: "rating", header: "Rating", sortValue: (d) => d.rating, cell: (d) => `${d.rating.toFixed(1)} ★`, hideOnMobile: true },
    {
      key: "available",
      header: "Available",
      sortValue: (d) => Number(d.available),
      cell: (d) => <Toggle checked={d.available} onChange={() => toggleAvailable(d)} label={`${d.name} available`} />,
    },
    {
      key: "actions",
      header: "",
      cell: (d) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setEditing(d)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-cream"
            aria-label={`Edit ${d.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(d)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-chili-deep hover:bg-chili-soft"
            aria-label={`Delete ${d.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Menu items"
        description={`${dishes.length} dishes · ${dishes.filter((d) => !d.available).length} unavailable. Edits here are a prototype and don't change the storefront yet.`}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> Add dish
          </Button>
        }
      />
      <DataTable
        caption="Menu items"
        rows={rows}
        columns={columns}
        rowKey={(d) => d.id}
        searchText={(d) => `${d.name} ${d.short} ${d.ingredients.join(" ")}`}
        searchPlaceholder="Search dishes or ingredients…"
        pageSize={8}
        toolbar={
          <div className="max-w-full overflow-x-auto">
            <FilterTabs
              label="Filter by category"
              value={category}
              onChange={setCategory}
              options={[{ id: "all", label: "All" }, ...categories.map((c) => ({ id: c.slug, label: c.name }))]}
            />
          </div>
        }
      />

      {editing && <DishForm key={editing === "new" ? "new" : editing.id} dish={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="It will disappear from the menu. You can undo from the notification."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!deleting) return;
                const snapshot = adminDishes.get();
                adminDishes.set((list) => list.filter((x) => x.id !== deleting.id));
                done("menu", "Deleted dish", deleting.name, "", () => adminDishes.set(snapshot));
                setDeleting(null);
              }}
            >
              Delete dish
            </Button>
          </>
        }
      >
        <p className="text-ash">Past orders keep their copy of this dish.</p>
      </Modal>
    </>
  );
}

type Draft = {
  name: string;
  category: string;
  price: string;
  short: string;
  spice: SpiceLevel;
  spiceAdjustable: boolean;
  badges: BadgeT[];
  available: boolean;
};

function DishForm({ dish, onClose }: { dish: AdminDish | null; onClose: () => void }) {
  const categories = adminCategories.useStore();
  const [d, setD] = useState<Draft>(() => ({
    name: dish?.name ?? "",
    category: dish?.category ?? categories[0]?.slug ?? "",
    price: dish ? String(dish.price) : "",
    short: dish?.short ?? "",
    spice: dish?.spice ?? 3,
    spiceAdjustable: dish?.spiceAdjustable ?? true,
    badges: dish?.badges ?? [],
    available: dish?.available ?? true,
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string | null>>>({});

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(d.price);
    const nameTaken = adminDishes.get().some((x) => x.name.toLowerCase() === d.name.trim().toLowerCase() && x.id !== dish?.id);
    const errs = {
      name: d.name.trim().length < 3 ? "Name needs at least 3 characters." : nameTaken ? "A dish with this name already exists." : null,
      price: !d.price ? "Price is required." : !Number.isFinite(price) || price < 20 || price > 5000 ? "Enter a price between ₹20 and ₹5,000." : null,
      short: d.short.trim().length < 10 ? "Add a short description (10+ characters)." : d.short.length > 120 ? "Keep it under 120 characters." : null,
      category: d.category ? null : "Choose a category.",
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    if (dish) {
      adminDishes.set((list) =>
        list.map((x) => (x.id === dish.id ? { ...x, ...d, name: d.name.trim(), short: d.short.trim(), price: Math.round(price) } : x)),
      );
      done("menu", "Updated dish", d.name.trim(), dish.price !== Math.round(price) ? `${money(dish.price)} → ${money(price)}` : "");
    } else {
      const slug = d.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const created: AdminDish = {
        id: slug,
        slug,
        name: d.name.trim(),
        category: d.category,
        short: d.short.trim(),
        story: d.short.trim(),
        price: Math.round(price),
        image: photos.spices,
        rating: 0,
        reviewCount: 0,
        spice: d.spice,
        spiceAdjustable: d.spiceAdjustable,
        diet: [],
        badges: d.badges,
        calories: 0,
        prepMinutes: 15,
        ingredients: [],
        addOns: [],
        sizes: [],
        profile: [],
        available: d.available,
      };
      adminDishes.set((list) => [created, ...list]);
      done("menu", "Created dish", created.name, money(created.price));
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={dish ? `Edit ${dish.name}` : "Add a dish"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="dish-form">{dish ? "Save changes" : "Create dish"}</Button>
        </>
      }
    >
      <form id="dish-form" onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
        <Field label="Dish name" error={errors.name} className="sm:col-span-2">
          {(p) => <Input {...p} value={d.name} onChange={(e) => set("name", e.target.value)} data-autofocus />}
        </Field>
        <Field label="Category" error={errors.category}>
          {(p) => (
            <Select {...p} value={d.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Price (₹)" error={errors.price}>
          {(p) => <Input {...p} inputMode="numeric" value={d.price} onChange={(e) => set("price", e.target.value.replace(/[^\d.]/g, ""))} />}
        </Field>
        <Field label="Short description" error={errors.short} hint={`${d.short.length}/120`} className="sm:col-span-2">
          {(p) => <Textarea {...p} value={d.short} onChange={(e) => set("short", e.target.value)} className="min-h-20" />}
        </Field>
        <div className="sm:col-span-2">
          <SpiceMeter value={d.spice} onChange={(v) => set("spice", v)} />
          <Checkbox
            className="mt-4"
            label="Customers can adjust the heat"
            checked={d.spiceAdjustable}
            onChange={(e) => set("spiceAdjustable", e.target.checked)}
          />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">Badges</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {badgeOptions.map((b) => (
              <Checkbox
                key={b.id}
                label={b.label}
                checked={d.badges.includes(b.id)}
                onChange={(e) => set("badges", e.target.checked ? [...d.badges, b.id] : d.badges.filter((x) => x !== b.id))}
              />
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <Toggle checked={d.available} onChange={(v) => set("available", v)} label="Available to order" showLabel />
        </div>
      </form>
    </Modal>
  );
}
