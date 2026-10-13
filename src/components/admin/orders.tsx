"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import type { AdminOrder } from "@/lib/admin/data";
import { adminOrders, done } from "@/lib/admin/store";
import { toast } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { formatDate, money } from "@/lib/utils";
import { AdminPageHeader } from "./admin-shell";
import { FilterTabs, OrderStatusPill, orderStatusLabel } from "./bits";
import { type Column, DataTable } from "./data-table";
import { nextLabel, nextStatus } from "./overview";

type Tab = "all" | "active" | "delivered" | "cancelled";
const allStatuses: OrderStatus[] = ["placed", "preparing", "packed", "on-the-way", "delivered", "cancelled"];

function setStatus(order: AdminOrder, to: OrderStatus) {
  const from = order.status;
  if (from === to) return;
  adminOrders.set((list) => list.map((o) => (o.id === order.id ? { ...o, status: to } : o)));
  done("orders", to === "cancelled" ? "Cancelled order" : "Order status updated", order.id, `${orderStatusLabel(from)} → ${orderStatusLabel(to)}`, () =>
    adminOrders.set((list) => list.map((o) => (o.id === order.id ? { ...o, status: from } : o))),
  );
}

export function OrdersAdmin() {
  const orders = adminOrders.useStore();
  const [tab, setTab] = useState<Tab>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.find((o) => o.id === openId) ?? null;

  const isActive = (o: AdminOrder) => !["delivered", "cancelled"].includes(o.status);
  const rows = orders.filter((o) => (tab === "all" ? true : tab === "active" ? isActive(o) : o.status === tab));

  const columns: Column<AdminOrder>[] = [
    { key: "id", header: "Order", cell: (o) => <span className="font-mono font-semibold">{o.id}</span>, sortValue: (o) => o.id },
    {
      key: "customer",
      header: "Customer",
      cell: (o) => <span className="font-medium">{o.customerName}</span>,
      sortValue: (o) => o.customerName,
    },
    {
      key: "items",
      header: "Items",
      hideOnMobile: true,
      cell: (o) => <span className="line-clamp-1 max-w-56 text-ash">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>,
    },
    { key: "placed", header: "Placed", cell: (o) => <span className="whitespace-nowrap text-ash">{formatDate(o.createdAt, true)}</span>, sortValue: (o) => o.createdAt, hideOnMobile: true },
    { key: "total", header: "Total", align: "right", cell: (o) => <span className="font-semibold">{money(o.total)}</span>, sortValue: (o) => o.total },
    { key: "status", header: "Status", cell: (o) => <OrderStatusPill status={o.status} />, sortValue: (o) => allStatuses.indexOf(o.status) },
    {
      key: "action",
      header: "Action",
      cell: (o) =>
        nextStatus[o.status] ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={(e) => {
              e.stopPropagation();
              setStatus(o, nextStatus[o.status]!);
            }}
          >
            {nextLabel[o.status]}
          </Button>
        ) : (
          <span className="text-xs text-ash">—</span>
        ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Accept, progress and cancel orders. Changes are simulated and logged in the audit trail."
        actions={
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export is simulated", description: `${rows.length} orders would be exported as CSV.` })}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />
      <DataTable
        caption="Orders"
        rows={rows}
        columns={columns}
        rowKey={(o) => o.id}
        rowLabel={(o) => `Open order ${o.id} from ${o.customerName}`}
        onRowClick={(o) => setOpenId(o.id)}
        searchText={(o) => `${o.id} ${o.customerName} ${o.items.map((i) => i.name).join(" ")}`}
        searchPlaceholder="Search order ID, customer, dish…"
        initialSort={{ key: "placed", dir: "desc" }}
        emptyTitle="No orders match"
        toolbar={
          <FilterTabs<Tab>
            label="Filter by status"
            value={tab}
            onChange={setTab}
            options={[
              { id: "all", label: "All", count: orders.length },
              { id: "active", label: "Active", count: orders.filter(isActive).length },
              { id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
              { id: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
            ]}
          />
        }
      />
      {open && <OrderDetail order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function OrderDetail({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [status, setLocal] = useState<OrderStatus>(order.status);
  const [confirmCancel, setConfirmCancel] = useState(false);
  return (
    <Modal
      open
      onClose={onClose}
      title={`Order ${order.id}`}
      description={`${order.customerName} · ${formatDate(order.createdAt, true)} · ${order.channel === "app" ? "App" : "Web"} · ${order.payment.toUpperCase()}`}
      footer={
        confirmCancel ? (
          <>
            <p className="mr-auto self-center text-sm font-medium text-chili-deep">Cancel this order and notify the customer?</p>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep order</Button>
            <Button
              onClick={() => {
                setStatus(order, "cancelled");
                onClose();
              }}
            >
              Yes, cancel
            </Button>
          </>
        ) : (
          <>
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <Button variant="danger" className="mr-auto" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button
              variant="dark"
              disabled={status === order.status}
              onClick={() => {
                setStatus(order, status);
                onClose();
              }}
            >
              Save status
            </Button>
          </>
        )
      }
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-ash">Current:</span>
        <OrderStatusPill status={order.status} />
      </div>
      <ul className="mt-5 divide-y divide-cream-300 rounded-2xl bg-white px-4">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between py-3 text-sm">
            <span>
              <span className="font-mono text-ash">{it.qty}×</span> {it.name}
            </span>
            <span className="font-medium">{money(it.price * it.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 font-semibold">
          <span>Total (incl. tax)</span>
          <span>{money(order.total)}</span>
        </li>
      </ul>
      <Field label="Update status" className="mt-5">
        {(p) => (
          <Select {...p} value={status} onChange={(e) => setLocal(e.target.value as OrderStatus)} disabled={order.status === "cancelled"}>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)}
              </option>
            ))}
          </Select>
        )}
      </Field>
    </Modal>
  );
}
