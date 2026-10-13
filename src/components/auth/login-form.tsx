"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { DEMO_EMAIL } from "@/lib/data/account";
import { signIn, toast } from "@/lib/store";
import { validators } from "@/lib/validation";

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ash hover:bg-charcoal/5 hover:text-charcoal"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string | null; email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finish(user: { name: string; email: string }) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    signIn(user);
    toast({ title: `Welcome, ${user.name.trim().split(/\s+/)[0]}!`, tone: "success" });
    router.push(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errs = {
      name: validators.name(name),
      email: validators.email(email),
      password: password ? null : "Password is required.",
    };
    setErrors(errs);
    if (errs.name || errs.email || errs.password) return;
    if (password.length < 8) {
      setFormError("That email and password don't match. (Demo: any password with 8+ characters works.)");
      return;
    }
    finish({ name, email: email.trim() });
  }

  function quickDemo() {
    const nameError = validators.name(name);
    setErrors({ name: nameError });
    setFormError(null);
    if (nameError) {
      document.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
      return;
    }
    finish({ name, email: DEMO_EMAIL });
  }

  return (
    <div className="animate-rise">
      <p className="eyebrow text-chili-deep">Welcome</p>
      <h1 className="mt-2 text-5xl font-medium">Sign in</h1>
      <p className="mt-2 text-ash">
        New to SPICY?{" "}
        <Link href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-chili-deep underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
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
        <Field label="Password" error={errors.password}>
          {(p) => (
            <PasswordInput
              {...p}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((x) => ({ ...x, password: null }));
              }}
            />
          )}
        </Field>
        <div className="flex justify-end">
          <button
            type="button"
            className="cursor-pointer text-sm font-semibold text-ash hover:text-charcoal"
            onClick={() =>
              email && !validators.email(email)
                ? toast({ title: "Reset link sent (simulated)", description: `We'd email ${email} in a real app.` })
                : setErrors((x) => ({ ...x, email: "Enter your email first so we know where to send the link." }))
            }
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-widest text-ash">
        <span className="h-px flex-1 bg-charcoal/10" /> or <span className="h-px flex-1 bg-charcoal/10" />
      </div>
      <Button variant="dark" size="lg" className="w-full" onClick={quickDemo} disabled={loading}>
        <Sparkles className="h-5 w-5 text-saffron" aria-hidden /> Quick demo sign-in
      </Button>
      <p className="mt-2 text-center text-xs text-ash">Uses the name above — no email or password needed.</p>
    </div>
  );
}
