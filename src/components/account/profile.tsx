"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MailCheck, ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { SpiceMeter } from "@/components/shop/spice-meter";
import { signOut } from "@/lib/auth";
import { saveProfile } from "@/lib/db";
import { orderStats, toast, useFavorites, useOrders, userStore, useUser } from "@/lib/store";
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
    if (user.verified) {
      const result = await saveProfile({ name, email: user.email, phone, heatPreference: heat });
      if (!result.ok) {
        setSaving(false);
        toast({ title: "Couldn't save your profile", description: result.error, tone: "error" });
        return;
      }
    }
    userStore.set({ ...user, name: name.trim(), phone: phone.trim(), heatPreference: heat });
    setSaving(false);
    toast({ title: "Profile updated", tone: "success" });
  }

  return (
    <>
      <AccountHeading eyebrow={`Member since ${formatDate(user.memberSince)}`} title={`Hey, ${user.name.split(" ")[0]}.`} />

      {user.verified ? (
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-leaf-soft px-4 py-2 text-sm font-semibold text-leaf">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Email verified · you can order
        </p>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border-[1.5px] border-dashed border-saffron bg-saffron-soft/60 px-5 py-4">
          <p className="text-sm">
            <span className="font-semibold">Demo account — browsing only.</span> Sign in with your email to add to the bag and order.
          </p>
          <ButtonLink href="/login?next=/account" size="sm">
            <MailCheck className="h-4 w-4" aria-hidden /> Verify email
          </ButtonLink>
        </div>
      )}

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
          <Field label="Email" hint={user.verified ? "Verified with a one-time code." : "Demo account — not a real email."}>
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
