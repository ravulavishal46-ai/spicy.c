"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Banknote, CreditCard, Lock, MailCheck, MapPin, ShoppingBag, Smartphone, Zap, CalendarClock } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { FoodImage } from "@/components/ui/food-image";
import { lineUnitPrice } from "@/lib/pricing";
import { placeOrder, saveAddress, useAddresses, useCanOrder, useCart, useCartTotals, useUser } from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import type { PaymentMethod } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { formatCardNumber, formatExpiry, validators } from "@/lib/validation";
import { CouponForm, describeLine, SummaryRows } from "./cart-parts";

const DECLINE_CARD = "4000000000000002";

export function Checkout() {
  const hydrated = useHydrated();
  const lines = useCart();
  const canOrder = useCanOrder();
  const user = useUser();
  if (!hydrated) {
    return (
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_400px]" role="status" aria-label="Loading checkout">
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (!canOrder) {
    return (
      <EmptyState
        icon={<MailCheck className="h-9 w-9" />}
        title="Verify your email to order"
        body={
          user
            ? `You're browsing as a demo user (${user.name}). To place orders, sign in with your email and the one-time code we send you.`
            : "Sign in with your email and the one-time code we send you, then come back here to place your order."
        }
        action={<ButtonLink href="/login?next=/checkout">Sign in with email</ButtonLink>}
      />
    );
  }
  if (!lines.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-9 w-9" />}
        title="Nothing to check out"
        body="Your bag is empty. Add a few dishes and come back."
        action={<ButtonLink href="/menu">Browse the menu</ButtonLink>}
      />
    );
  }
  return <CheckoutForm />;
}

type FormState = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  city: string;
  pincode: string;
  card: string;
  expiry: string;
  cvc: string;
  upi: string;
};

function Section({ n, title, icon, children }: { n: number; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8" aria-labelledby={`co-${n}`}>
      <h2 id={`co-${n}`} className="flex items-center gap-3 text-2xl font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-charcoal font-mono text-sm text-cream">{n}</span>
        {title}
        <span className="ml-auto text-ash">{icon}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const user = useUser();
  const addresses = useAddresses();
  const lines = useCart();
  const totals = useCartTotals();
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    line1: "",
    city: "Hyderabad",
    pincode: "",
    card: "",
    expiry: "",
    cvc: "",
    upi: "",
  }));
  const [addressId, setAddressId] = useState<string>(() => addresses.find((a) => a.isDefault)?.id ?? "new");
  const [saveNew, setSaveNew] = useState(true);
  const [when, setWhen] = useState<"asap" | string>("asap");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string | null>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const e: Partial<Record<keyof FormState, string | null>> = {
      name: validators.name(form.name),
      phone: validators.phone(form.phone),
      email: validators.email(form.email),
    };
    if (addressId === "new") {
      e.line1 = validators.required("Street address")(form.line1);
      e.city = validators.required("City")(form.city);
      e.pincode = validators.pincode(form.pincode);
    }
    if (payment === "card") {
      e.card = validators.cardNumber(form.card);
      e.expiry = validators.expiry(form.expiry);
      e.cvc = validators.cvc(form.cvc);
    }
    if (payment === "upi") e.upi = validators.upi(form.upi);
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setPaymentError(null);
    const e = validate();
    setErrors(e);
    const firstBad = Object.entries(e).find(([, v]) => v)?.[0];
    if (firstBad) {
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      });
      return;
    }
    setSubmitting(true);
    // Simulated payment round-trip.
    await new Promise((r) => setTimeout(r, 1400));
    if (payment === "card" && form.card.replace(/\s/g, "") === DECLINE_CARD) {
      setSubmitting(false);
      setPaymentError("Your bank declined this (simulated) payment. Try another card or pay with UPI.");
      return;
    }
    let address: string;
    if (addressId === "new") {
      address = `${form.line1}, ${form.city} ${form.pincode}`;
      if (saveNew) {
        saveAddress({
          label: "Other",
          line1: form.line1,
          line2: "",
          city: form.city,
          pincode: form.pincode,
          phone: form.phone,
          isDefault: addresses.length === 0,
        });
      }
    } else {
      const a = addresses.find((x) => x.id === addressId)!;
      address = `${a.line1}, ${a.city} ${a.pincode}`;
    }
    const order = placeOrder({ customerName: form.name.trim(), address, payment });
    if (!order) {
      setSubmitting(false);
      return;
    }
    router.push(`/account/orders/${order.id}?placed=1`);
  }

  const slots = ["7:30 – 8:00 PM", "8:00 – 8:30 PM", "8:30 – 9:00 PM", "9:00 – 9:30 PM"];
  const payOptions: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: "upi", label: "UPI", icon: <Smartphone className="h-5 w-5" aria-hidden /> },
    { id: "card", label: "Card", icon: <CreditCard className="h-5 w-5" aria-hidden /> },
    { id: "cod", label: "Cash", icon: <Banknote className="h-5 w-5" aria-hidden /> },
  ];

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="container-x grid gap-10 pb-10 lg:grid-cols-[1fr_400px] lg:gap-14">
      <div className="space-y-6">

        <Section n={1} title="Contact" icon={null}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name} className="sm:col-span-2">
              {(p) => <Input {...p} name="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />}
            </Field>
            <Field label="Mobile number" error={errors.phone} hint="For delivery updates from your rider.">
              {(p) => (
                <Input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
              )}
            </Field>
            <Field label="Email" error={errors.email}>
              {(p) => <Input {...p} name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />}
            </Field>
          </div>
        </Section>

        <Section n={2} title="Delivery" icon={<MapPin className="h-5 w-5" aria-hidden />}>
          <fieldset>
            <legend className="sr-only">Delivery address</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "cursor-pointer rounded-2xl border-[1.5px] p-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-saffron/50",
                    addressId === a.id ? "border-charcoal bg-cream" : "border-cream-300 hover:border-charcoal/40",
                  )}
                >
                  <input type="radio" name="address" className="sr-only" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                  <span className="flex items-center justify-between">
                    <span className="font-semibold">{a.label}</span>
                    {addressId === a.id && <span className="h-3 w-3 rounded-full bg-chili ring-4 ring-chili-soft" aria-hidden />}
                  </span>
                  <span className="mt-1 block text-sm text-ash">
                    {a.line1}, {a.city} {a.pincode}
                  </span>
                </label>
              ))}
              <label
                className={cn(
                  "cursor-pointer rounded-2xl border-[1.5px] border-dashed p-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-saffron/50",
                  addressId === "new" ? "border-charcoal bg-cream" : "border-charcoal/20 hover:border-charcoal/50",
                )}
              >
                <input type="radio" name="address" className="sr-only" checked={addressId === "new"} onChange={() => setAddressId("new")} />
                <span className="font-semibold">+ New address</span>
                <span className="mt-1 block text-sm text-ash">Deliver somewhere else</span>
              </label>
            </div>
          </fieldset>

          {addressId === "new" && (
            <div className="mt-5 grid animate-rise gap-4 sm:grid-cols-[2fr_1fr_1fr]">
              <Field label="Street address" error={errors.line1} className="sm:col-span-3">
                {(p) => <Input {...p} name="line1" autoComplete="street-address" value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="Flat, building, street" />}
              </Field>
              <Field label="City" error={errors.city} className="sm:col-span-2">
                {(p) => <Input {...p} name="city" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} />}
              </Field>
              <Field label="PIN code" error={errors.pincode}>
                {(p) => <Input {...p} name="pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />}
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-3">
                <input type="checkbox" checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} className="h-4 w-4 accent-[var(--color-chili)]" />
                Save this address for next time
              </label>
            </div>
          )}

          <fieldset className="mt-7">
            <legend className="eyebrow mb-3 text-ash">When</legend>
            <div className="flex flex-wrap gap-2">
              {["asap", ...slots].map((s) => (
                <label
                  key={s}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-saffron/50",
                    when === s ? "border-charcoal bg-charcoal text-cream" : "border-charcoal/15 hover:border-charcoal/50",
                  )}
                >
                  <input type="radio" name="when" className="sr-only" checked={when === s} onChange={() => setWhen(s)} />
                  {s === "asap" ? (
                    <>
                      <Zap className="h-4 w-4" aria-hidden /> ASAP · ~32 min
                    </>
                  ) : (
                    <>
                      <CalendarClock className="h-4 w-4" aria-hidden /> {s}
                    </>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section n={3} title="Payment" icon={<Lock className="h-5 w-5" aria-hidden />}>
          <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-3 gap-2">
            {payOptions.map((o) => (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-[1.5px] py-4 text-sm font-semibold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-saffron/50",
                  payment === o.id ? "border-charcoal bg-cream" : "border-cream-300 hover:border-charcoal/40",
                )}
              >
                <input type="radio" name="payment" className="sr-only" checked={payment === o.id} onChange={() => setPayment(o.id)} />
                {o.icon}
                {o.label}
              </label>
            ))}
          </div>

          <div className="mt-5">
            {payment === "card" && (
              <div className="grid animate-rise gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                <Field label="Card number" error={errors.card} className="sm:col-span-3" hint="Demo: 4242 4242 4242 4242 succeeds, 4000 0000 0000 0002 is declined.">
                  {(p) => (
                    <Input {...p} name="card" inputMode="numeric" autoComplete="off" value={form.card} onChange={(e) => set("card", formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" className="font-mono" />
                  )}
                </Field>
                <Field label="Expiry" error={errors.expiry} className="sm:col-start-2">
                  {(p) => <Input {...p} name="expiry" inputMode="numeric" autoComplete="off" value={form.expiry} onChange={(e) => set("expiry", formatExpiry(e.target.value))} placeholder="MM/YY" className="font-mono" />}
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  {(p) => <Input {...p} name="cvc" inputMode="numeric" autoComplete="off" maxLength={4} value={form.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, ""))} placeholder="123" className="font-mono" />}
                </Field>
              </div>
            )}
            {payment === "upi" && (
              <Field label="UPI ID" error={errors.upi} hint="Demo only — any valid-looking ID works, e.g. demo@upi.">
                {(p) => <Input {...p} name="upi" autoComplete="off" value={form.upi} onChange={(e) => set("upi", e.target.value)} placeholder="yourname@bank" />}
              </Field>
            )}
            {payment === "cod" && <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-ash">Pay the rider in cash or by UPI when your food arrives.</p>}
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-ash">
            <Lock className="h-3.5 w-3.5" aria-hidden /> This is a prototype. Card details never leave your browser and nothing is charged.
          </p>
        </Section>
      </div>

      <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-5 rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-semibold">Your order</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {lines.map((l) => {
              const d = describeLine(l);
              return (
                <li key={l.key} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <FoodImage src={d.image} alt="" label={d.title} className="h-14 w-14 rounded-xl" sizes="60px" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-charcoal px-1 font-mono text-[0.65rem] font-bold text-cream">
                      {l.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{d.title}</p>
                    <p className="truncate text-xs text-ash">{d.detail}</p>
                  </div>
                  <span className="text-sm font-medium">{money(lineUnitPrice(l) * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <CouponForm />
          <SummaryRows totals={totals} />
          {paymentError && (
            <p role="alert" className="rounded-xl bg-chili-soft px-4 py-3 text-sm font-medium text-chili-deep">
              {paymentError}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            {submitting ? "Processing…" : `Place order · ${money(totals.total)}`}
          </Button>
        </div>
      </aside>
    </form>
  );
}
