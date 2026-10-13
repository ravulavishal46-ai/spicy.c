"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { SpiceMeter } from "@/components/shop/spice-meter";
import { orderStats, signOut, toast, useFavorites, useOrders, userStore, useUser } from "@/lib/store";
import type { SpiceLevel } from "@/lib/types";
import { formatDate, money } from "@/lib/utils";
import { validators } from "@/lib/validation";
import { AccountHeading } from "./account-shell";

export function Profile() {
  const user = useUser()!;
  const orders = useOrders();
  const favorites = useFavorites();
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [heat, setHeat] = useState<SpiceLevel>(user.heatPreference);
  const [errors, setErrors] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saving, setSaving] = useState(false);

  const stats = orderStats(orders);
  const dirty = name !== user.name || phone !== user.phone || heat !== user.heatPreference;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const errs = { name: validators.name(name), phone: phone.trim() ? validators.phone(phone) : null };
    setErrors(errs);
    if (errs.name || errs.phone) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    userStore.set({ ...user, name: name.trim(), phone: phone.trim(), heatPreference: heat });
    setSaving(false);
    toast({ title: "Profile updated", tone: "success" });
  }

  return (
    <>
      <AccountHeading eyebrow={`Member since ${formatDate(user.memberSince)}`} title={`Hey, ${user.name.split(" ")[0]}.`} />

      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Orders", String(stats.count)],
          ["Favorites", String(favorites.length)],
          ["Spent", money(stats.spent)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)]">
            <dt className="text-sm text-ash">{label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <form onSubmit={save} noValidate className="mt-8 grid gap-8 rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8 xl:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Personal details</h2>
          <Field label="Full name" error={errors.name}>
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
          </Field>
          <Field label="Email" hint="Email changes need verification in the real product.">
            {(p) => <Input {...p} value={user.email} disabled />}
          </Field>
          <Field label="Mobile" error={errors.phone}>
            {(p) => <Input {...p} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="Add a mobile number" />}
          </Field>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Heat preference</h2>
          <p className="mb-2 mt-1 text-sm text-ash">Used for your personalised menu and as the starting point on new dishes.</p>
          <SpiceMeter value={heat} onChange={setHeat} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-cream-300 pt-6 xl:col-span-2">
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save changes
          </Button>
          {dirty && (
            <Button
              variant="ghost"
              onClick={() => {
                setName(user.name);
                setPhone(user.phone);
                setHeat(user.heatPreference);
                setErrors({});
              }}
            >
              Discard
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </Button>
      </div>
    </>
  );
}
