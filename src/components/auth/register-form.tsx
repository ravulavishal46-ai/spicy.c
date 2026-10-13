"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { SpiceMeter } from "@/components/shop/spice-meter";
import { signIn, toast } from "@/lib/store";
import type { SpiceLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { validators } from "@/lib/validation";
import { PasswordInput, safeNext } from "./login-form";

type Fields = { name: string; email: string; phone: string; password: string; confirm: string };

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/\d/.test(pw) && /[a-z]/i.test(pw)) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[^a-z0-9]/i.test(pw) || pw.length >= 12) s++;
  return s;
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [f, setF] = useState<Fields>({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [heat, setHeat] = useState<SpiceLevel>(3);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "terms", string | null>>>({});
  const [loading, setLoading] = useState(false);
  const pwStrength = strength(f.password);

  function set(key: keyof Fields, value: string) {
    setF((x) => ({ ...x, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = {
      name: validators.name(f.name),
      email: validators.email(f.email),
      phone: validators.phone(f.phone),
      password: validators.password(f.password),
      confirm: !f.confirm ? "Please confirm your password." : f.confirm !== f.password ? "Passwords don't match." : null,
      terms: terms ? null : "Please accept the (fictional) terms to continue.",
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    signIn({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), heatPreference: heat, memberSince: new Date().toISOString() });
    toast({ title: `Welcome to SPICY, ${f.name.trim().split(" ")[0]}!`, tone: "success" });
    router.push(next);
  }

  return (
    <div className="animate-rise">
      <p className="eyebrow text-chili-deep">Join the heat</p>
      <h1 className="mt-2 text-5xl font-medium">Create account</h1>
      <p className="mt-2 text-ash">
        Already have one?{" "}
        <Link href="/login" className="font-semibold text-chili-deep underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Field label="Full name" error={errors.name}>
          {(p) => <Input {...p} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.email}>
            {(p) => <Input {...p} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
          <Field label="Mobile" error={errors.phone}>
            {(p) => <Input {...p} type="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" />}
          </Field>
        </div>
        <Field label="Password" error={errors.password} hint="8+ characters with letters and numbers.">
          {(p) => <PasswordInput {...p} autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} />}
        </Field>
        {f.password && (
          <div className="-mt-2" aria-live="polite">
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < pwStrength ? (pwStrength <= 1 ? "bg-chili" : pwStrength === 2 ? "bg-saffron" : "bg-leaf") : "bg-charcoal/10",
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-ash">Strength: {["Too weak", "Weak", "Okay", "Strong", "Very strong"][pwStrength]}</p>
          </div>
        )}
        <Field label="Confirm password" error={errors.confirm}>
          {(p) => (
            <div className="relative">
              <PasswordInput {...p} autoComplete="new-password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} />
              {f.confirm && f.confirm === f.password && (
                <Check className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 text-leaf" aria-label="Passwords match" />
              )}
            </div>
          )}
        </Field>

        <div className="rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="font-semibold">Your usual heat</p>
          <p className="mb-2 text-sm text-ash">We&apos;ll use this to personalise your menu. Change it any time.</p>
          <SpiceMeter value={heat} onChange={setHeat} />
        </div>

        <div>
          <Checkbox
            checked={terms}
            onChange={(e) => {
              setTerms(e.target.checked);
              setErrors((x) => ({ ...x, terms: null }));
            }}
            aria-invalid={Boolean(errors.terms)}
            label="I agree to the terms and privacy policy"
            description="Fictional — this prototype stores nothing outside your browser."
          />
          {errors.terms && (
            <p role="alert" className="mt-2 text-xs font-medium text-chili-deep">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
    </div>
  );
}
