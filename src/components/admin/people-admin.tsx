"use client";

import { useState } from "react";
import { Ban, Mail, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge, Stars } from "@/components/ui/misc";
import { ADMIN_NOW, type AdminCustomer, type InventoryItem } from "@/lib/admin/data";
import { adminCoupons, adminCustomers, adminInventory, adminOrders, adminReviews, done, stockLevel } from "@/lib/admin/store";
import { getDish } from "@/lib/data/menu";
import { spiceInfo } from "@/lib/data/spice";
import { toast } from "@/lib/store";
import type { Coupon, CouponKind, Review, SpiceLevel } from "@/lib/types";
import { cn, formatDate, money } from "@/lib/utils";
import { AdminPageHeader } from "./admin-shell";
import { FilterTabs, OrderStatusPill, StockPill, Toggle } from "./bits";
import { type Column, DataTable } from "./data-table";

/* -------------------------------- Customers ------------------------------- */

function segment(c: AdminCustomer): { label: string; tone: "dark" | "saffron" | "leaf" | "neutral" } {
  const daysSince = (ADMIN_NOW - new Date(c.lastOrder).getTime()) / 86400000;
  if (c.status === "blocked") return { label: "Blocked", tone: "neutral" };
  if (c.spent > 15000) return { label: "VIP", tone: "dark" };
  if (daysSince > 30) return { label: "At risk", tone: "saffron" };
  if (c.orders < 5) return { label: "New", tone: "leaf" };
  return { label: "Regular", tone: "neutral" };
}

export function CustomersAdmin() {
  const customers = adminCustomers.useStore();
  const [seg, setSeg] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = customers.find((c) => c.id === openId) ?? null;
  const rows = seg === "all" ? customers : customers.filter((c) => segment(c).label === seg);

  const columns: Column<AdminCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      sortValue: (c) => c.name,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron-soft font-display font-bold">{c.name.charAt(0)}</span>
          <div className="min-w-0">
            <p className="font-semibold">{c.name}</p>
            <p className="truncate text-xs text-ash">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "segment", header: "Segment", cell: (c) => <Badge tone={segment(c).tone}>{segment(c).label}</Badge>, sortValue: (c) => segment(c).label },
    { key: "orders", header: "Orders", align: "right", sortValue: (c) => c.orders, cell: (c) => c.orders },
    { key: "spent", header: "Lifetime value", align: "right", sortValue: (c) => c.spent, cell: (c) => <span className="font-semibold">{money(c.spent)}</span> },
    { key: "last", header: "Last order", sortValue: (c) => c.lastOrder, cell: (c) => <span className="text-ash">{formatDate(c.lastOrder)}</span>, hideOnMobile: true },
    { key: "heat", header: "Usual heat", sortValue: (c) => c.heat, cell: (c) => spiceInfo(c.heat as SpiceLevel).name, hideOnMobile: true },
  ];

  return (
    <>
      <AdminPageHeader title="Customers" description="Fictional customer records for demonstration. Contact details are placeholders." />
      <DataTable
        caption="Customers"
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id}
        onRowClick={(c) => setOpenId(c.id)}
        rowLabel={(c) => `Open customer ${c.name}`}
        searchText={(c) => `${c.name} ${c.email} ${c.id}`}
        searchPlaceholder="Search name, email, ID…"
        initialSort={{ key: "spent", dir: "desc" }}
        toolbar={
          <FilterTabs
            label="Filter by segment"
            value={seg}
            onChange={setSeg}
            options={["all", "VIP", "Regular", "New", "At risk", "Blocked"].map((s) => ({
              id: s,
              label: s === "all" ? "All" : s,
              count: s === "all" ? customers.length : customers.filter((c) => segment(c).label === s).length,
            }))}
          />
        }
      />
      {open && <CustomerDetail customer={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function CustomerDetail({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const orders = adminOrders.useStore().filter((o) => o.customerId === customer.id).slice(0, 5);
  const blocked = customer.status === "blocked";
  return (
    <Modal
      open
      onClose={onClose}
      title={customer.name}
      description={`${customer.id} · joined ${formatDate(customer.joined)}`}
      footer={
        <>
          <Button
            variant={blocked ? "outline" : "danger"}
            className="mr-auto"
            onClick={() => {
              adminCustomers.set((list) => list.map((c) => (c.id === customer.id ? { ...c, status: blocked ? "active" : "blocked" } : c)));
              done("customers", blocked ? "Unblocked customer" : "Blocked customer", customer.name);
            }}
          >
            {blocked ? <ShieldCheck className="h-4 w-4" aria-hidden /> : <Ban className="h-4 w-4" aria-hidden />}
            {blocked ? "Unblock" : "Block customer"}
          </Button>
          <Button variant="dark" onClick={() => toast({ title: "Email is simulated", description: `Nothing was sent to ${customer.email}.` })}>
            <Mail className="h-4 w-4" aria-hidden /> Email
          </Button>
        </>
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Orders", String(customer.orders)],
          ["Lifetime", money(customer.spent)],
          ["Avg. order", money(customer.orders ? customer.spent / customer.orders : 0)],
          ["Usual heat", spiceInfo(customer.heat as SpiceLevel).name],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white p-3">
            <dt className="text-xs text-ash">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-ash">
        {customer.email} · {customer.phone}
      </p>
      <h3 className="mt-6 font-sans text-sm font-semibold tracking-normal">Recent orders</h3>
      {orders.length ? (
        <ul className="mt-2 divide-y divide-cream-300 rounded-xl bg-white px-4">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="font-mono">{o.id}</span>
              <span className="text-ash">{formatDate(o.createdAt)}</span>
              <span className="font-medium">{money(o.total)}</span>
              <OrderStatusPill status={o.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ash">No orders in the current demo window.</p>
      )}
    </Modal>
  );
}

/* --------------------------------- Coupons -------------------------------- */

export function CouponsAdmin() {
  const coupons = adminCoupons.useStore();
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);

  const columns: Column<Coupon>[] = [
    { key: "code", header: "Code", sortValue: (c) => c.code, cell: (c) => <span className="rounded-md border border-dashed border-charcoal/30 px-2 py-1 font-mono text-xs font-bold">{c.code}</span> },
    { key: "title", header: "Offer", sortValue: (c) => c.title, cell: (c) => <div><p className="font-semibold">{c.title}</p><p className="text-xs text-ash">{c.description}</p></div> },
    { key: "min", header: "Min. order", align: "right", sortValue: (c) => c.minSubtotal, cell: (c) => money(c.minSubtotal), hideOnMobile: true },
    { key: "uses", header: "Uses", align: "right", sortValue: (c) => c.uses, cell: (c) => c.uses.toLocaleString("en-IN"), hideOnMobile: true },
    { key: "expires", header: "Expires", sortValue: (c) => c.expires, cell: (c) => <span className="text-ash">{formatDate(c.expires)}</span>, hideOnMobile: true },
    {
      key: "active",
      header: "Active",
      sortValue: (c) => Number(c.active),
      cell: (c) => (
        <Toggle
          checked={c.active}
          label={`${c.code} active`}
          onChange={(v) => {
            adminCoupons.set((list) => list.map((x) => (x.code === c.code ? { ...x, active: v } : x)));
            done("coupons", v ? "Activated coupon" : "Deactivated coupon", c.code);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Create and manage promo codes. Admin changes don't affect checkout in this prototype."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> New coupon
          </Button>
        }
      />
      <DataTable
        caption="Coupons"
        rows={coupons}
        columns={columns}
        rowKey={(c) => c.code}
        onRowClick={(c) => setEditing(c)}
        rowLabel={(c) => `Edit coupon ${c.code}`}
        searchText={(c) => `${c.code} ${c.title}`}
        searchPlaceholder="Search codes…"
      />
      {editing && <CouponForm key={editing === "new" ? "new" : editing.code} coupon={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function CouponForm({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const [f, setF] = useState({
    code: coupon?.code ?? "",
    title: coupon?.title ?? "",
    kind: (coupon?.kind ?? "percent") as CouponKind,
    value: coupon ? String(coupon.value) : "",
    minSubtotal: coupon ? String(coupon.minSubtotal) : "299",
    maxDiscount: coupon?.maxDiscount ? String(coupon.maxDiscount) : "",
    expires: coupon?.expires ?? "2026-12-31",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const set = (k: keyof typeof f, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = f.code.trim().toUpperCase();
    const value = Number(f.value);
    const taken = adminCoupons.get().some((c) => c.code === code && c.code !== coupon?.code);
    const errs = {
      code: !/^[A-Z0-9]{4,15}$/.test(code) ? "4–15 letters or numbers, no spaces." : taken ? "That code already exists." : null,
      title: f.title.trim().length < 4 ? "Add a customer-facing title." : null,
      value:
        f.kind === "free-delivery"
          ? null
          : !value || value <= 0
            ? "Enter a value."
            : f.kind === "percent" && value > 90
              ? "Percent discounts max out at 90%."
              : null,
      minSubtotal: Number(f.minSubtotal) < 0 || f.minSubtotal === "" ? "Enter a minimum (0 for none)." : null,
      expires: !f.expires ? "Pick an expiry date." : null,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const next: Coupon = {
      code,
      title: f.title.trim(),
      description:
        f.kind === "free-delivery"
          ? `Free delivery on orders above ₹${f.minSubtotal}.`
          : `${f.kind === "percent" ? `${value}%` : `₹${value}`} off on orders above ₹${f.minSubtotal}.`,
      kind: f.kind,
      value: f.kind === "free-delivery" ? 0 : value,
      minSubtotal: Number(f.minSubtotal),
      maxDiscount: f.maxDiscount ? Number(f.maxDiscount) : null,
      expires: f.expires,
      active: coupon?.active ?? true,
      uses: coupon?.uses ?? 0,
    };
    adminCoupons.set((list) => (coupon ? list.map((c) => (c.code === coupon.code ? next : c)) : [next, ...list]));
    done("coupons", coupon ? "Updated coupon" : "Created coupon", code, next.description);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={coupon ? `Edit ${coupon.code}` : "New coupon"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="coupon-form">Save coupon</Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" error={errors.code}>
          {(p) => <Input {...p} value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className="font-mono uppercase" data-autofocus />}
        </Field>
        <Field label="Type">
          {(p) => (
            <Select {...p} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
              <option value="percent">Percent off</option>
              <option value="flat">Flat amount off</option>
              <option value="free-delivery">Free delivery</option>
            </Select>
          )}
        </Field>
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          {(p) => <Input {...p} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 20% off your order" />}
        </Field>
        {f.kind !== "free-delivery" && (
          <Field label={f.kind === "percent" ? "Percent" : "Amount (₹)"} error={errors.value}>
            {(p) => <Input {...p} inputMode="numeric" value={f.value} onChange={(e) => set("value", e.target.value.replace(/\D/g, ""))} />}
          </Field>
        )}
        {f.kind === "percent" && (
          <Field label="Max discount (₹)" optional>
            {(p) => <Input {...p} inputMode="numeric" value={f.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value.replace(/\D/g, ""))} />}
          </Field>
        )}
        <Field label="Minimum order (₹)" error={errors.minSubtotal}>
          {(p) => <Input {...p} inputMode="numeric" value={f.minSubtotal} onChange={(e) => set("minSubtotal", e.target.value.replace(/\D/g, ""))} />}
        </Field>
        <Field label="Expires" error={errors.expires}>
          {(p) => <Input {...p} type="date" value={f.expires} onChange={(e) => set("expires", e.target.value)} />}
        </Field>
      </form>
    </Modal>
  );
}

/* -------------------------------- Inventory ------------------------------- */

export function InventoryAdmin() {
  const items = adminInventory.useStore();
  const [filter, setFilter] = useState<"all" | "attention">("all");
  const [restocking, setRestocking] = useState<InventoryItem | null>(null);
  const attention = items.filter((i) => stockLevel(i.stock, i.par) !== "ok");
  const rows = filter === "all" ? items : attention;
  const value = items.reduce((s, i) => s + i.stock * i.costPerUnit, 0);

  const columns: Column<InventoryItem>[] = [
    { key: "name", header: "Item", sortValue: (i) => i.name, cell: (i) => <div><p className="font-semibold">{i.name}</p><p className="text-xs text-ash">{i.supplier}</p></div> },
    {
      key: "level",
      header: "Stock vs par",
      sortValue: (i) => i.stock / i.par,
      cell: (i) => {
        const pct = Math.min(100, (i.stock / i.par) * 100);
        const lvl = stockLevel(i.stock, i.par);
        return (
          <div className="min-w-40">
            <div className="flex justify-between text-xs">
              <span className="font-mono">
                {i.stock} / {i.par} {i.unit}
              </span>
              <span className="text-ash">{Math.round((i.stock / i.par) * 100)}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-cream-200">
              <div
                className={cn("h-full rounded-full", lvl === "ok" ? "bg-leaf" : lvl === "low" ? "bg-saffron" : "bg-chili")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    { key: "status", header: "Status", sortValue: (i) => i.stock / i.par, cell: (i) => <StockPill level={stockLevel(i.stock, i.par)} /> },
    { key: "cost", header: "Unit cost", align: "right", sortValue: (i) => i.costPerUnit, cell: (i) => money(i.costPerUnit), hideOnMobile: true },
    { key: "updated", header: "Updated", sortValue: (i) => i.updatedAt, cell: (i) => <span className="text-ash">{formatDate(i.updatedAt, true)}</span>, hideOnMobile: true },
    {
      key: "restock",
      header: "",
      cell: (i) => (
        <Button size="sm" variant="outline" className="h-8" onClick={() => setRestocking(i)}>
          Restock
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Inventory" description={`Stock value ≈ ${money(value)} · ${attention.length} items below par.`} />
      <DataTable
        caption="Inventory"
        rows={rows}
        columns={columns}
        rowKey={(i) => i.id}
        searchText={(i) => `${i.name} ${i.supplier}`}
        searchPlaceholder="Search ingredients or suppliers…"
        initialSort={{ key: "status", dir: "asc" }}
        emptyTitle="Nothing needs attention"
        emptyBody="Every item is stocked above 70% of par."
        toolbar={
          <FilterTabs<"all" | "attention">
            label="Filter inventory"
            value={filter}
            onChange={setFilter}
            options={[
              { id: "all", label: "All items", count: items.length },
              { id: "attention", label: "Needs attention", count: attention.length },
            ]}
          />
        }
      />
      {restocking && <RestockForm key={restocking.id} item={restocking} onClose={() => setRestocking(null)} />}
    </>
  );
}

function RestockForm({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [qty, setQty] = useState(String(Math.max(0, Math.ceil(item.par - item.stock))));
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={`Restock ${item.name}`}
      description={`Currently ${item.stock} ${item.unit} · par ${item.par} ${item.unit}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="restock-form">Log delivery</Button>
        </>
      }
    >
      <form
        id="restock-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(qty);
          if (!qty || !Number.isFinite(n) || n <= 0) return setError("Enter a quantity greater than 0.");
          if (n > item.par * 5) return setError(`That's over 5× par — double-check the amount.`);
          adminInventory.set((list) =>
            list.map((x) => (x.id === item.id ? { ...x, stock: Math.round((x.stock + n) * 10) / 10, updatedAt: new Date().toISOString() } : x)),
          );
          done("inventory", "Restocked", item.name, `+${n} ${item.unit}`);
          onClose();
        }}
      >
        <Field label={`Quantity received (${item.unit})`} error={error}>
          {(p) => (
            <Input
              {...p}
              inputMode="decimal"
              value={qty}
              onChange={(e) => {
                setQty(e.target.value.replace(/[^\d.]/g, ""));
                setError(null);
              }}
              data-autofocus
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}

/* --------------------------------- Reviews -------------------------------- */

export function ReviewsAdmin() {
  const reviews = adminReviews.useStore();
  const [tab, setTab] = useState<Review["status"] | "all">("pending");
  const [replying, setReplying] = useState<Review | null>(null);
  const rows = tab === "all" ? reviews : reviews.filter((r) => r.status === tab);

  function setStatus(r: Review, status: Review["status"]) {
    const prev = r.status;
    adminReviews.set((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)));
    done("reviews", status === "published" ? "Published review" : "Hid review", r.title, `by ${r.author}`, () =>
      adminReviews.set((list) => list.map((x) => (x.id === r.id ? { ...x, status: prev } : x))),
    );
  }

  return (
    <>
      <AdminPageHeader title="Reviews" description="Moderate customer reviews and reply publicly." />
      <div className="mb-4">
        <FilterTabs
          label="Filter reviews"
          value={tab}
          onChange={setTab}
          options={(["pending", "published", "hidden", "all"] as const).map((s) => ({
            id: s,
            label: s[0].toUpperCase() + s.slice(1),
            count: s === "all" ? reviews.length : reviews.filter((r) => r.status === s).length,
          }))}
        />
      </div>
      {rows.length === 0 ? (
        <div className="rounded-[1.25rem] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="font-semibold">Nothing to show</p>
          <p className="text-sm text-ash">{tab === "pending" ? "All reviews have been moderated. Nice." : "No reviews in this state."}</p>
        </div>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col rounded-[1.25rem] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-charcoal/[0.04]">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <Badge tone={r.status === "pending" ? "saffron" : r.status === "published" ? "leaf" : "neutral"}>{r.status}</Badge>
              </div>
              <p className="mt-3 font-display text-xl font-semibold">{r.title}</p>
              <p className="mt-1 text-sm text-charcoal/80">{r.body}</p>
              <p className="mt-3 text-xs text-ash">
                {r.author} · {getDish(r.dishId)?.name ?? "Unknown dish"} · {formatDate(r.date)}
              </p>
              {r.reply && (
                <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-sm">
                  <span className="font-semibold">Your reply: </span>
                  {r.reply}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {r.status !== "published" && (
                  <Button size="sm" variant="dark" onClick={() => setStatus(r, "published")}>
                    Publish
                  </Button>
                )}
                {r.status !== "hidden" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(r, "hidden")}>
                    Hide
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setReplying(r)}>
                  {r.reply ? "Edit reply" : "Reply"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {replying && <ReplyForm key={replying.id} review={replying} onClose={() => setReplying(null)} />}
    </>
  );
}

function ReplyForm({ review, onClose }: { review: Review; onClose: () => void }) {
  const [text, setText] = useState(review.reply ?? "");
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal
      open
      onClose={onClose}
      title="Reply publicly"
      description={`To ${review.author}: “${review.title}”`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="reply-form">Post reply</Button>
        </>
      }
    >
      <form
        id="reply-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim().length < 5) return setError("Write at least a few words.");
          if (text.length > 300) return setError("Keep replies under 300 characters.");
          adminReviews.set((list) => list.map((x) => (x.id === review.id ? { ...x, reply: text.trim() } : x)));
          done("reviews", "Replied to review", review.title);
          onClose();
        }}
      >
        <Field label="Reply" error={error} hint={`${text.length}/300 · Visible to everyone once published.`}>
          {(p) => (
            <Textarea
              {...p}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              data-autofocus
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}
