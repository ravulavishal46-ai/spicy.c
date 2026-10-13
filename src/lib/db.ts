"use client";

import { supabase } from "./supabase/client";
import type { Order, OrderItem, OrderStatus, PaymentMethod, SpiceLevel } from "./types";

/*
 * Database access for signed-in, email-verified customers (Supabase).
 * Tables: profiles (registrations), orders, order_items.
 * Row-level security lets each customer read and write only their own rows.
 */

export type DbResult = { ok: true } | { ok: false; error: string };

function failure(error: { message?: string } | null | undefined, fallback: string): DbResult {
  const message = (error?.message ?? "").toLowerCase();
  if (message.includes("failed to fetch") || message.includes("network")) {
    return { ok: false, error: "Couldn't reach the server. Check your internet connection and try again." };
  }
  if (message.includes("jwt") || message.includes("not authenticated") || message.includes("row-level security")) {
    return { ok: false, error: "Your sign-in has expired. Please sign in with your email again." };
  }
  return { ok: false, error: fallback };
}

async function currentUserId() {
  const { data } = await supabase().auth.getSession();
  return data.session?.user.id ?? null;
}

/** Saves the registration details (name, heat preference, last sign-in) for the signed-in user. */
export async function saveProfile(details: { name: string; email: string; phone?: string; heatPreference?: SpiceLevel }): Promise<DbResult> {
  try {
    const id = await currentUserId();
    if (!id) return { ok: false, error: "Not signed in." };
    const row: Record<string, unknown> = {
      id,
      email: details.email,
      name: details.name.trim().slice(0, 80),
      last_sign_in_at: new Date().toISOString(),
    };
    if (details.phone !== undefined) row.phone = details.phone.trim() || null;
    if (details.heatPreference !== undefined) row.heat_preference = details.heatPreference;
    const { error } = await supabase().from("profiles").upsert(row, { onConflict: "id" });
    return error ? failure(error, "Couldn't save your profile.") : { ok: true };
  } catch (e) {
    return failure(e as Error, "Couldn't save your profile.");
  }
}

/** Writes the order and its dishes. The order only counts as placed if this succeeds. */
export async function saveOrder(order: Order, contact: { email: string; phone: string }): Promise<DbResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Your sign-in has expired. Please sign in with your email again." };
    const { data, error } = await supabase()
      .from("orders")
      .insert({
        order_number: order.id,
        user_id: userId,
        customer_name: order.customerName,
        customer_email: contact.email,
        phone: contact.phone || null,
        delivery_address: order.address,
        payment_method: order.payment,
        coupon_code: order.couponCode,
        subtotal: order.subtotal,
        discount: order.discount,
        delivery_fee: order.delivery,
        tax: order.tax,
        total: order.total,
        status: "placed",
        created_at: order.createdAt,
      })
      .select("id")
      .single();
    if (error || !data) return failure(error, "Couldn't place your order. Please try again.");

    const { error: itemsError } = await supabase()
      .from("order_items")
      .insert(
        order.items.map((item) => ({
          order_id: data.id,
          dish_id: item.dishId,
          dish_name: item.name.slice(0, 200),
          quantity: item.qty,
          unit_price: item.unitPrice,
          spice_level: item.spice,
          details: item.detail || null,
        })),
      );
    if (itemsError) return failure(itemsError, "Your order was saved without its dishes. Please contact support.");
    return { ok: true };
  } catch (e) {
    return failure(e as Error, "Couldn't place your order. Please try again.");
  }
}

/** Marks a new order as cancelled (the database only allows this before cooking starts). */
export async function cancelOrderInDb(orderNumber: string): Promise<DbResult> {
  try {
    const { error } = await supabase().from("orders").update({ status: "cancelled" }).eq("order_number", orderNumber);
    return error ? failure(error, "Couldn't cancel the order.") : { ok: true };
  } catch (e) {
    return failure(e as Error, "Couldn't cancel the order.");
  }
}

interface OrderRow {
  order_number: string;
  customer_name: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: { dish_id: string; dish_name: string; quantity: number; unit_price: number; spice_level: number | null; details: string | null }[];
}

/** Loads the signed-in customer's orders from the database (newest first). */
export async function fetchMyOrders(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase()
      .from("orders")
      .select(
        "order_number, customer_name, delivery_address, payment_method, coupon_code, subtotal, discount, delivery_fee, tax, total, status, created_at, order_items (dish_id, dish_name, quantity, unit_price, spice_level, details)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return null;
    return (data as unknown as OrderRow[]).map((row) => ({
      id: row.order_number,
      createdAt: row.created_at,
      customerName: row.customer_name,
      items: row.order_items.map(
        (i): OrderItem => ({
          dishId: i.dish_id,
          name: i.dish_name,
          qty: i.quantity,
          unitPrice: Number(i.unit_price),
          spice: (i.spice_level ?? 1) as SpiceLevel,
          detail: i.details ?? "",
        }),
      ),
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      delivery: Number(row.delivery_fee),
      tax: Number(row.tax),
      total: Number(row.total),
      status: row.status,
      address: row.delivery_address,
      payment: row.payment_method,
      couponCode: row.coupon_code,
      // New orders keep the simulated live tracking on this device.
      live: row.status === "placed",
    }));
  } catch {
    return null;
  }
}
