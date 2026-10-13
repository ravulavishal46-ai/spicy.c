"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/misc";
import { type AuditEvent, dailySeries, ordersByHour, type StoreSettings } from "@/lib/admin/data";
import { adminAudit, adminOrders, adminSettings, done, resetAdminDemo } from "@/lib/admin/store";
import { categories, getDish } from "@/lib/data/menu";
import { spiceLevels } from "@/lib/data/spice";
import { toast } from "@/lib/store";
import { useHydrated } from "@/lib/store/create-store";
import { formatDate, money } from "@/lib/utils";
import { AdminPageHeader } from "./admin-shell";
import { FilterTabs, Panel, StatCard, Toggle } from "./bits";
import { BarList, ColumnChart, compact, LineChart } from "./charts";
import { type Column, DataTable } from "./data-table";

/* -------------------------------- Analytics ------------------------------- */

type Range = "7" | "30" | "90";

export function AnalyticsAdmin() {
  const [range, setRange] = useState<Range>("30");
  const days = Number(range);
  const series = dailySeries(days);
  const previous = dailySeries(days * 2).slice(0, days);
  const sum = (arr: typeof series, k: "orders" | "revenue") => arr.reduce((s, d) => s + d[k], 0);
  const rev = sum(series, "revenue");
  const prevRev = sum(previous, "revenue");
  const orders = sum(series, "orders");
  const prevOrders = sum(previous, "orders");
  const pct = (a: number, b: number) => ((a - b) / b) * 100;

  const adminOrderList = adminOrders.useStore();
  const byCategory = new Map<string, number>();
  const byHeat = new Map<number, number>();
  for (const o of adminOrderList) {
    for (const it of o.items) {
      const d = getDish(it.dishId);
      if (!d) continue;
      byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + it.price * it.qty);
      byHeat.set(d.spice, (byHeat.get(d.spice) ?? 0) + it.qty);
    }
  }
  const scale = days / 4; // stretch the sample orders to the selected window
  const categoryData = categories
    .map((c) => ({ label: c.name, value: Math.round((byCategory.get(c.slug) ?? 0) * scale) }))
    .sort((a, b) => b.value - a.value);

  const dateLabel = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Simulated performance data — deterministic mock numbers for layout and interaction testing."
        actions={
          <FilterTabs<Range>
            label="Date range"
            value={range}
            onChange={setRange}
            options={[
              { id: "7", label: "7 days" },
              { id: "30", label: "30 days" },
              { id: "90", label: "90 days" },
            ]}
          />
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Revenue" value={"₹" + compact(rev)} delta={pct(rev, prevRev)} hint={`vs previous ${days} days`} />
        <StatCard label="Orders" value={orders.toLocaleString("en-IN")} delta={pct(orders, prevOrders)} hint={`vs previous ${days} days`} />
        <StatCard label="Avg. order value" value={money(rev / orders)} delta={pct(rev / orders, prevRev / prevOrders)} />
        <StatCard label="Repeat customers" value="62%" delta={1.8} hint="ordered 2+ times" />
      </div>

      <Panel title={`Revenue · last ${days} days`} className="mt-5">
        <LineChart label={`Daily revenue, last ${days} days`} data={series.map((d) => ({ x: dateLabel(d.date), y: d.revenue }))} format={(n) => "₹" + compact(n)} height={260} />
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Orders by hour" action={<span className="text-xs text-ash">typical day</span>}>
          <ColumnChart label="Orders by hour of day" data={ordersByHour.map((h) => ({ x: h.hour, y: h.orders }))} format={(n) => `${Math.round(n)} orders`} />
        </Panel>
        <Panel title="Revenue by category">
          <BarList label="Revenue by category" data={categoryData} format={(n) => "₹" + compact(n)} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Items sold by heat level" action={<span className="text-xs text-ash">house default heat</span>}>
          <ColumnChart
            label="Items sold by heat level"
            data={spiceLevels.map((s) => ({ x: s.name, y: Math.round((byHeat.get(s.level) ?? 0) * scale) }))}
            format={(n) => `${Math.round(n)} items`}
          />
        </Panel>
        <Panel title="Orders per day">
          <ColumnChart label={`Orders per day, last ${days} days`} data={series.map((d) => ({ x: dateLabel(d.date), y: d.orders }))} format={(n) => `${Math.round(n)} orders`} highlightMax={days <= 30} />
        </Panel>
      </div>
    </>
  );
}

/* --------------------------- Settings & audit log ------------------------- */

export function SettingsAdmin() {
  const [tab, setTab] = useState<"store" | "team" | "audit">("store");
  const hydrated = useHydrated();
  return (
    <>
      <AdminPageHeader title="Settings & audit" description="Store configuration, team access and a log of every admin action in this prototype." />
      <div className="mb-5">
        <FilterTabs
          label="Settings sections"
          value={tab}
          onChange={setTab}
          options={[
            { id: "store", label: "Store" },
            { id: "team", label: "Team & roles" },
            { id: "audit", label: "Audit activity" },
          ]}
        />
      </div>
      {tab === "store" && (hydrated ? <StoreSettingsForm /> : <div className="skeleton h-96" aria-hidden />)}
      {tab === "team" && <Team />}
      {tab === "audit" && <AuditLog />}
    </>
  );
}

function StoreSettingsForm() {
  const saved = adminSettings.useStore();
  const [s, setS] = useState<StoreSettings>(saved);
  const [errors, setErrors] = useState<Partial<Record<keyof StoreSettings, string | null>>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);

  function set<K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) {
    setS((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const errs = {
      storeName: s.storeName.trim().length < 3 ? "Store name is required." : null,
      deliveryFee: s.deliveryFee < 0 || s.deliveryFee > 500 ? "Between ₹0 and ₹500." : null,
      freeDeliveryOver: s.freeDeliveryOver < 0 ? "Must be 0 or more." : null,
      prepBufferMinutes: s.prepBufferMinutes < 0 || s.prepBufferMinutes > 60 ? "Between 0 and 60 minutes." : null,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const changes = (Object.keys(s) as (keyof StoreSettings)[]).filter((k) => s[k] !== saved[k]);
    adminSettings.set(s);
    done("settings", "Changed settings", changes.join(", ") || "none");
  }

  return (
    <form onSubmit={save} noValidate className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <Panel title="Store details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name" error={errors.storeName} className="sm:col-span-2">
            {(p) => <Input {...p} value={s.storeName} onChange={(e) => set("storeName", e.target.value)} />}
          </Field>
          <Field label="Opens at">
            {(p) => <Input {...p} type="time" value={s.opensAt} onChange={(e) => set("opensAt", e.target.value)} />}
          </Field>
          <Field label="Closes at" hint="Times after midnight close the next day.">
            {(p) => <Input {...p} type="time" value={s.closesAt} onChange={(e) => set("closesAt", e.target.value)} />}
          </Field>
          <Field label="Delivery fee (₹)" error={errors.deliveryFee}>
            {(p) => <Input {...p} type="number" min={0} value={s.deliveryFee} onChange={(e) => set("deliveryFee", Number(e.target.value))} />}
          </Field>
          <Field label="Free delivery over (₹)" error={errors.freeDeliveryOver}>
            {(p) => <Input {...p} type="number" min={0} value={s.freeDeliveryOver} onChange={(e) => set("freeDeliveryOver", Number(e.target.value))} />}
          </Field>
          <Field label="Prep buffer" error={errors.prepBufferMinutes}>
            {(p) => (
              <Select {...p} value={s.prepBufferMinutes} onChange={(e) => set("prepBufferMinutes", Number(e.target.value))}>
                {[0, 5, 10, 15, 20].map((m) => (
                  <option key={m} value={m}>{m} minutes</option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Panel>
      <div className="space-y-5">
        <Panel title="Operations">
          <div className="space-y-4">
            <Toggle checked={s.acceptingOrders} onChange={(v) => set("acceptingOrders", v)} label="Accepting new orders" showLabel />
            <Toggle checked={s.autoAcceptOrders} onChange={(v) => set("autoAcceptOrders", v)} label="Auto-accept incoming orders" showLabel />
            <Toggle checked={s.showSpiceWarnings} onChange={(v) => set("showSpiceWarnings", v)} label="Show Inferno heat warnings" showLabel />
          </div>
        </Panel>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!dirty}>
            <Save className="h-4 w-4" aria-hidden /> Save settings
          </Button>
          {dirty && (
            <Button variant="ghost" onClick={() => setS(saved)}>
              Discard
            </Button>
          )}
          <Button variant="danger" className="ml-auto" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset demo data
          </Button>
        </div>
      </div>
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title="Reset all admin demo data?"
        description="Orders, menu, coupons, inventory, reviews, settings and the audit log go back to their original mock state."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button
              onClick={() => {
                resetAdminDemo();
                setS(adminSettings.get());
                setConfirmReset(false);
                toast({ title: "Admin demo data reset" });
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p className="text-ash">This only affects data stored in this browser.</p>
      </Modal>
    </form>
  );
}

const team = [
  { name: "Demo Admin", email: "admin@spicy.test", role: "Owner", last: "Now" },
  { name: "Priya (demo manager)", email: "priya@spicy.test", role: "Manager", last: "2 hours ago" },
  { name: "Sam (demo staff)", email: "sam@spicy.test", role: "Kitchen staff", last: "Yesterday" },
  { name: "Ravi (demo rider)", email: "ravi@spicy.test", role: "Rider", last: "Today" },
];

function Team() {
  return (
    <div className="space-y-5">
      <div role="note" className="rounded-[1.25rem] border-[1.5px] border-dashed border-saffron bg-saffron-soft/60 p-5 text-sm">
        <p className="font-semibold">Roles are illustrative only.</p>
        <p className="mt-1 text-charcoal/75">
          This prototype has no authentication. Before launch, sign-in, role checks and every data change must be enforced on the server —
          hiding buttons in the UI is not security.
        </p>
      </div>
      <Panel title="Team members">
        <ul className="divide-y divide-cream-200">
          {team.map((m) => (
            <li key={m.email} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-cream-200 font-display font-bold">{m.name.charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-ash">{m.email}</p>
              </div>
              <Badge tone={m.role === "Owner" ? "dark" : "neutral"}>{m.role}</Badge>
              <span className="w-28 text-right text-xs text-ash">Active {m.last}</span>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => toast({ title: "Invites are simulated in this prototype" })}>
          Invite teammate
        </Button>
      </Panel>
    </div>
  );
}

function AuditLog() {
  const events = adminAudit.useStore();
  const [area, setArea] = useState<"all" | AuditEvent["area"]>("all");
  // Events are stored newest-first; keep that order by default.
  const rows = area === "all" ? events : events.filter((e) => e.area === area);
  const areas: AuditEvent["area"][] = ["orders", "menu", "categories", "customers", "coupons", "inventory", "reviews", "settings"];

  const columns: Column<AuditEvent>[] = [
    { key: "at", header: "When", sortValue: (e) => e.at, cell: (e) => <span className="whitespace-nowrap text-ash">{formatDate(e.at, true)}</span> },
    { key: "actor", header: "Who", sortValue: (e) => e.actor, cell: (e) => <span className="font-medium">{e.actor}</span> },
    { key: "action", header: "Action", sortValue: (e) => e.action, cell: (e) => e.action },
    { key: "target", header: "Target", cell: (e) => <span className="font-medium">{e.target}</span> },
    { key: "detail", header: "Detail", hideOnMobile: true, cell: (e) => <span className="text-ash">{e.detail || "—"}</span> },
    { key: "area", header: "Area", hideOnMobile: true, sortValue: (e) => e.area, cell: (e) => <Badge tone="outline">{e.area}</Badge> },
  ];

  return (
    <DataTable
      caption="Audit activity"
      rows={rows}
      columns={columns}
      rowKey={(e) => e.id}
      searchText={(e) => `${e.actor} ${e.action} ${e.target} ${e.detail}`}
      searchPlaceholder="Search activity…"
      pageSize={12}
      emptyTitle="No activity yet"
      emptyBody="Actions you take in the admin will appear here."
      toolbar={
        <Field label="Area" className="flex-row items-center gap-2 [&>label]:sr-only">
          {(p) => (
            <Select {...p} value={area} onChange={(e) => setArea(e.target.value as typeof area)} className="h-10 w-44 rounded-full">
              <option value="all">All areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a[0].toUpperCase() + a.slice(1)}</option>
              ))}
            </Select>
          )}
        </Field>
      }
    />
  );
}
