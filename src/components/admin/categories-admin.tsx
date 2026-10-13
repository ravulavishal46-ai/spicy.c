"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FoodImage } from "@/components/ui/food-image";
import { adminCategories, adminDishes, done } from "@/lib/admin/store";
import { unsplash } from "@/lib/data/images";
import { useHydrated } from "@/lib/store/create-store";
import type { Category, ComboRole } from "@/lib/types";
import { AdminPageHeader } from "./admin-shell";

export function CategoriesAdmin() {
  const hydrated = useHydrated();
  const categories = adminCategories.useStore();
  const dishes = adminDishes.useStore();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[i], next[j]] = [next[j], next[i]];
    adminCategories.set(next);
    done("categories", "Reordered", categories[i].name, `position ${i + 1} → ${j + 1}`);
  }

  const count = (slug: string) => dishes.filter((d) => d.category === slug).length;

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Order controls how categories appear on the menu."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> Add category
          </Button>
        }
      />
      <ol className="grid gap-3">
        {(hydrated ? categories : []).map((c, i) => (
          <li key={c.slug} className="flex min-w-0 items-center gap-2 rounded-[1.25rem] sm:gap-4 bg-white p-3 pr-4 shadow-[var(--shadow-soft)] ring-1 ring-charcoal/[0.04]">
            <span className="w-6 text-center font-mono text-sm text-ash">{i + 1}</span>
            <FoodImage src={c.image} alt="" label={c.name} className="h-14 w-14 shrink-0 rounded-xl" sizes="56px" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="truncate text-sm text-ash">{c.tagline}</p>
            </div>
            <span className="hidden rounded-full bg-cream px-3 py-1 text-xs font-semibold sm:inline">{count(c.slug)} dishes</span>
            <span className="hidden text-xs text-ash md:inline">{c.comboRole ? `Combo: ${c.comboRole}` : "Not in combos"}</span>
            <div className="flex">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-cream disabled:opacity-30" aria-label={`Move ${c.name} up`}>
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-cream disabled:opacity-30" aria-label={`Move ${c.name} down`}>
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setEditing(c)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-cream" aria-label={`Edit ${c.name}`}>
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setDeleting(c)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-chili-deep hover:bg-chili-soft" aria-label={`Delete ${c.name}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {!hydrated && [0, 1, 2, 3].map((i) => <li key={i} className="skeleton h-20" />)}
      </ol>

      {editing && <CategoryForm key={editing === "new" ? "new" : editing.slug} category={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        size="sm"
        footer={
          deleting && count(deleting.slug) > 0 ? (
            <Button variant="dark" onClick={() => setDeleting(null)}>Got it</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!deleting) return;
                  const snapshot = adminCategories.get();
                  adminCategories.set((list) => list.filter((x) => x.slug !== deleting.slug));
                  done("categories", "Deleted category", deleting.name, "", () => adminCategories.set(snapshot));
                  setDeleting(null);
                }}
              >
                Delete
              </Button>
            </>
          )
        }
      >
        {deleting && count(deleting.slug) > 0 ? (
          <p role="alert" className="rounded-xl bg-chili-soft px-4 py-3 text-sm font-medium text-chili-deep">
            This category still has {count(deleting.slug)} dishes. Move or delete them first.
          </p>
        ) : (
          <p className="text-ash">This category is empty and can be removed safely.</p>
        )}
      </Modal>
    </>
  );
}

function CategoryForm({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [tagline, setTagline] = useState(category?.tagline ?? "");
  const [role, setRole] = useState<ComboRole | "none">(category?.comboRole ?? "none");
  const [errors, setErrors] = useState<{ name?: string | null; tagline?: string | null }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const taken = adminCategories.get().some((c) => c.slug === slug && c.slug !== category?.slug);
    const errs = {
      name: name.trim().length < 3 ? "Name needs at least 3 characters." : taken ? "That category already exists." : null,
      tagline: tagline.trim().length < 5 ? "Add a short tagline." : null,
    };
    setErrors(errs);
    if (errs.name || errs.tagline) return;
    const comboRole = role === "none" ? null : role;
    if (category) {
      adminCategories.set((list) => list.map((c) => (c.slug === category.slug ? { ...c, name: name.trim(), tagline: tagline.trim(), comboRole } : c)));
      done("categories", "Updated category", name.trim());
    } else {
      adminCategories.set((list) => [
        ...list,
        { slug, name: name.trim(), tagline: tagline.trim(), description: tagline.trim(), image: unsplash("1504674900247-0877df9cc836"), comboRole },
      ]);
      done("categories", "Created category", name.trim());
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={category ? `Edit ${category.name}` : "New category"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="category-form">Save</Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Name" error={errors.name}>
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} data-autofocus />}
        </Field>
        <Field label="Tagline" error={errors.tagline}>
          {(p) => <Textarea {...p} value={tagline} onChange={(e) => setTagline(e.target.value)} className="min-h-20" />}
        </Field>
        <Field label="Role in Build-Your-Combo">
          {(p) => (
            <Select {...p} value={role} onChange={(e) => setRole(e.target.value as ComboRole | "none")}>
              <option value="none">Not offered in combos</option>
              <option value="main">Main</option>
              <option value="side">Side</option>
              <option value="drink">Drink</option>
            </Select>
          )}
        </Field>
      </form>
    </Modal>
  );
}
