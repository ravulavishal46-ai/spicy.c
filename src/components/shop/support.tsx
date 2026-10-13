"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge, Stars } from "@/components/ui/misc";
import { demoReviews, faqs } from "@/lib/data/account";
import { dishes, getDish } from "@/lib/data/menu";
import { toast, useOrders, useUser } from "@/lib/store";
import { createStore } from "@/lib/store/create-store";
import type { Review } from "@/lib/types";
import { cn, formatDate, uid } from "@/lib/utils";
import { validators } from "@/lib/validation";

const myReviewsStore = createStore<Review[]>("my-reviews", []);

export function ReviewsSection() {
  const mine = myReviewsStore.useStore();
  const [filter, setFilter] = useState(0);
  const all = [...mine, ...demoReviews.filter((r) => r.status === "published")];
  const published = demoReviews.filter((r) => r.status === "published");
  const avg = published.reduce((s, r) => s + r.rating, 0) / published.length;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: published.filter((r) => r.rating === n).length }));
  const shown = filter ? all.filter((r) => r.rating === filter) : all;

  return (
    <section id="reviews" aria-labelledby="reviews-h" className="scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="reviews-h" className="text-4xl font-medium">Reviews</h2>
          <div className="mt-6 rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="font-display text-6xl font-semibold">{avg.toFixed(1)}</p>
            <Stars value={Math.round(avg)} className="mt-1" />
            <p className="mt-1 text-sm text-ash">from {published.length} written reviews (demo)</p>
            <ul className="mt-5 space-y-1.5">
              {dist.map(({ n, count }) => (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => setFilter(filter === n ? 0 : n)}
                    aria-pressed={filter === n}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm transition-colors",
                      filter === n ? "bg-saffron-soft" : "hover:bg-cream",
                    )}
                  >
                    <span className="w-8 font-mono">{n}★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                      <span className="block h-full rounded-full bg-saffron" style={{ width: `${(count / published.length) * 100}%` }} />
                    </span>
                    <span className="w-5 text-right text-ash">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <WriteReview />
        </div>

        <div>
          {filter > 0 && (
            <p className="mb-4 text-sm">
              Showing {filter}-star reviews ·{" "}
              <button type="button" onClick={() => setFilter(0)} className="cursor-pointer font-semibold text-chili-deep hover:underline">
                Show all
              </button>
            </p>
          )}
          {shown.length === 0 ? (
            <p className="rounded-[1.5rem] border-[1.5px] border-dashed border-charcoal/15 p-10 text-center text-ash">No {filter}-star reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {shown.map((r) => {
                const dish = getDish(r.dishId);
                return (
                  <li key={r.id} className="rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Stars value={r.rating} />
                      <div className="flex items-center gap-2">
                        {r.status === "pending" && <Badge tone="saffron">Awaiting moderation</Badge>}
                        <span className="text-xs text-ash">{formatDate(r.date)}</span>
                      </div>
                    </div>
                    <p className="mt-3 font-display text-2xl font-semibold">{r.title}</p>
                    <p className="mt-1 text-charcoal/80">{r.body}</p>
                    <p className="mt-4 text-sm">
                      <span className="font-semibold">{r.author}</span>
                      {dish && (
                        <>
                          {" "}on{" "}
                          <Link href={`/food/${dish.slug}`} className="font-semibold text-chili-deep hover:underline">
                            {dish.name}
                          </Link>
                        </>
                      )}
                    </p>
                    {r.reply && (
                      <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm">
                        <span className="font-semibold text-chili-deep">SPICY replied: </span>
                        {r.reply}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function WriteReview() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [dishId, setDishId] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = {
      dish: dishId ? null : "Choose the dish you're reviewing.",
      rating: rating ? null : "Pick a star rating.",
      title: title.trim().length < 3 ? "Add a short headline (3+ characters)." : null,
      body: body.trim().length < 10 ? "Tell us a little more (10+ characters)." : body.length > 500 ? "Keep it under 500 characters." : null,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    myReviewsStore.set((list) => [
      {
        id: uid("rv-"),
        dishId,
        rating,
        title: title.trim(),
        body: body.trim(),
        author: user ? `${user.name} (you)` : "Guest (you)",
        date: new Date().toISOString(),
        status: "pending",
      },
      ...list,
    ]);
    toast({ title: "Review submitted", description: "It'll appear publicly once moderated (simulated).", tone: "success" });
    setOpen(false);
    setDishId("");
    setRating(0);
    setTitle("");
    setBody("");
  }

  if (!open) {
    return (
      <Button variant="dark" className="mt-4 w-full" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4 text-saffron" aria-hidden /> Write a review
      </Button>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 animate-rise space-y-4 rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)]">
      <p className="font-display text-xl font-semibold">Your review</p>
      <Field label="Dish" error={errors.dish}>
        {(p) => (
          <Select {...p} value={dishId} onChange={(e) => setDishId(e.target.value)}>
            <option value="">Select a dish…</option>
            {dishes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-md p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-chili">
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => {
                  setRating(n);
                  setErrors((x) => ({ ...x, rating: null }));
                }}
                className="sr-only"
              />
              <span className="sr-only">{n} stars</span>
              <Star
                aria-hidden
                onMouseEnter={() => setHover(n)}
                className={cn("h-7 w-7 transition-transform hover:scale-110", n <= (hover || rating) ? "fill-saffron text-saffron" : "text-cream-300")}
              />
            </label>
          ))}
        </div>
        {errors.rating && <p role="alert" className="mt-1 text-xs font-medium text-chili-deep">{errors.rating}</p>}
      </fieldset>
      <Field label="Headline" error={errors.title}>
        {(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />}
      </Field>
      <Field label="Review" error={errors.body} hint={`${body.length}/500`}>
        {(p) => <Textarea {...p} value={body} onChange={(e) => setBody(e.target.value)} />}
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Submit review</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function FaqList() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="scroll-mt-28">
      <h2 id="faq-h" className="text-4xl font-medium">Frequently asked</h2>
      <div className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 max-w-2xl text-ash">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ContactForm() {
  const user = useUser();
  const orders = useOrders();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [topic, setTopic] = useState("order");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = {
      name: validators.name(name),
      email: validators.email(email),
      message: message.trim().length < 15 ? "Please describe the issue in at least 15 characters." : null,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setTicket("TKT-" + Math.floor(10000 + Math.random() * 89999));
  }

  if (ticket) {
    return (
      <div role="status" className="flex flex-col items-center rounded-[1.75rem] bg-leaf-soft p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-leaf" aria-hidden />
        <p className="mt-4 font-display text-3xl font-semibold">We&apos;re on it.</p>
        <p className="mt-2 text-charcoal/75">
          Ticket <span className="font-mono font-semibold">{ticket}</span> created (simulated). A human would usually reply within 10 minutes.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setTicket(null);
            setMessage("");
            setOrderId("");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:grid-cols-2 sm:p-8">
      <Field label="Name" error={errors.name}>
        {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
      </Field>
      <Field label="Email" error={errors.email}>
        {(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />}
      </Field>
      <Field label="Topic">
        {(p) => (
          <Select {...p} value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="order">Problem with an order</option>
            <option value="payment">Payment or refund</option>
            <option value="allergy">Allergens & ingredients</option>
            <option value="feedback">Feedback</option>
            <option value="other">Something else</option>
          </Select>
        )}
      </Field>
      <Field label="Order" optional>
        {(p) => (
          <Select {...p} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            <option value="">Not about a specific order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} · {formatDate(o.createdAt)}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="How can we help?" error={errors.message} className="sm:col-span-2">
        {(p) => <Textarea {...p} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what happened…" />}
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={sending}>
          Send message
        </Button>
      </div>
    </form>
  );
}
