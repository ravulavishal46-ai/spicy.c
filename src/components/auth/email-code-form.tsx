"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { SpiceMeter } from "@/components/shop/spice-meter";
import { sendEmailCode, signInDemo, verifyEmailCode } from "@/lib/auth";
import { toast } from "@/lib/store";
import type { SpiceLevel } from "@/lib/types";
import { validators } from "@/lib/validation";

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

const RESEND_SECONDS = 60;

/**
 * Passwordless sign-in: name + email → a one-time code is emailed → the user
 * types it in. Only a correct code signs them in with ordering access.
 * The demo option lets people browse without ordering.
 */
export function EmailCodeForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [heat, setHeat] = useState<SpiceLevel>(3);
  const [errors, setErrors] = useState<{ name?: string | null; email?: string | null; code?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setFormError(null);
    const errs = { name: validators.name(name), email: validators.email(email) };
    setErrors(errs);
    if (errs.name || errs.email) return;
    setBusy("send");
    const result = await sendEmailCode(email, name);
    setBusy(null);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setStep("code");
    setCode("");
    setCooldown(RESEND_SECONDS);
    toast({ title: "Code sent", description: `Check ${email.trim()} for your sign-in code.`, tone: "success" });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const digits = code.replace(/\D/g, "");
    if (digits.length < 6) {
      setErrors({ code: "Enter the 6-digit code from the email." });
      return;
    }
    setBusy("verify");
    const result = await verifyEmailCode(email, digits, name, mode === "register" ? { heatPreference: heat } : {});
    setBusy(null);
    if (!result.ok) {
      setErrors({ code: result.error });
      setCode("");
      codeRef.current?.focus();
      return;
    }
    toast({ title: `Welcome, ${name.trim().split(/\s+/)[0]}! You can order now.`, tone: "success" });
    router.push(next);
  }

  function demo() {
    const nameError = validators.name(name);
    setErrors({ name: nameError });
    setFormError(null);
    if (nameError) {
      document.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
      return;
    }
    signInDemo(name);
    toast({ title: `Hi ${name.trim().split(/\s+/)[0]} — browsing as demo`, description: "Sign in with your email to order." });
    router.push(next === "/account" ? "/menu" : next);
  }

  if (step === "code") {
    return (
      <div className="animate-rise">
        <button
          type="button"
          onClick={() => {
            setStep("details");
            setErrors({});
            setFormError(null);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-ash hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Change email
        </button>
        <div className="mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-saffron-soft text-chili">
          <MailCheck className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-5xl font-medium">Check your email</h1>
        <p className="mt-2 text-ash">
          We sent a sign-in code to <strong className="text-charcoal">{email.trim()}</strong>. Enter it below. It expires in about an
          hour.
        </p>

        <form onSubmit={verify} noValidate className="mt-8 space-y-5">
          <Field label="Sign-in code" error={errors.code} hint="Can't find it? Check your spam or promotions folder.">
            {(p) => (
              <Input
                {...p}
                ref={codeRef}
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={10}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  setErrors({});
                }}
                placeholder="••••••"
                className="h-16 text-center font-mono text-3xl tracking-[0.5em] placeholder:tracking-[0.5em]"
              />
            )}
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={busy === "verify"}>
            <ShieldCheck className="h-5 w-5" aria-hidden /> Verify and sign in
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-ash">
          Didn&apos;t get it?{" "}
          {cooldown > 0 ? (
            <span>Send a new code in {cooldown}s</span>
          ) : (
            <button type="button" onClick={() => send()} disabled={busy !== null} className="cursor-pointer font-semibold text-chili-deep hover:underline">
              Send a new code
            </button>
          )}
        </p>
        {formError && (
          <p role="alert" className="mt-4 rounded-xl bg-chili-soft px-4 py-3 text-sm font-medium text-chili-deep">
            {formError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <p className="eyebrow text-chili-deep">{mode === "register" ? "Join the heat" : "Welcome"}</p>
      <h1 className="mt-2 text-5xl font-medium">{mode === "register" ? "Create account" : "Sign in"}</h1>
      <p className="mt-2 text-ash">
        {mode === "register" ? (
          <>
            Already have one?{" "}
            <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-chili-deep underline-offset-2 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No password needed — we&apos;ll email you a one-time code. New here?{" "}
            <Link href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-chili-deep underline-offset-2 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>

      <form onSubmit={send} noValidate className="mt-8 space-y-5">
        {formError && (
          <p role="alert" className="rounded-xl bg-chili-soft px-4 py-3 text-sm font-medium text-chili-deep">
            {formError}
          </p>
        )}
        <Field label="Your name" error={errors.name} hint="This is the name shown on your profile.">
          {(p) => (
            <Input
              {...p}
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((x) => ({ ...x, name: null }));
              }}
              placeholder="e.g. Priya Sharma"
            />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(p) => (
            <Input
              {...p}
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((x) => ({ ...x, email: null }));
              }}
              placeholder="you@example.com"
            />
          )}
        </Field>
        {mode === "register" && (
          <div className="rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="font-semibold">Your usual heat</p>
            <p className="mb-2 text-sm text-ash">We&apos;ll use this to personalise your menu. Change it any time.</p>
            <SpiceMeter value={heat} onChange={setHeat} />
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" loading={busy === "send"}>
          <MailCheck className="h-5 w-5" aria-hidden /> Email me a sign-in code
        </Button>
      </form>

      {mode === "login" && (
        <>
          <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-widest text-ash">
            <span className="h-px flex-1 bg-charcoal/10" /> or <span className="h-px flex-1 bg-charcoal/10" />
          </div>
          <Button variant="outline" size="lg" className="w-full" onClick={demo} disabled={busy !== null}>
            <Eye className="h-5 w-5" aria-hidden /> Browse as demo
          </Button>
          <p className="mt-2 text-center text-xs text-ash">Uses the name above. Demo can view every dish but can&apos;t add to the bag or order.</p>
        </>
      )}
    </div>
  );
}
