"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { Badge, EmptyState } from "@/components/ui/misc";
import { deleteAddress, saveAddress, useAddresses } from "@/lib/store";
import type { Address } from "@/lib/types";
import { validators } from "@/lib/validation";
import { AccountHeading } from "./account-shell";

type Draft = Omit<Address, "id"> & { id?: string };
const empty: Draft = { label: "Home", line1: "", line2: "", city: "Hyderabad", pincode: "", phone: "", isDefault: false };

export function Addresses() {
  const addresses = useAddresses();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Address | null>(null);

  return (
    <>
      <AccountHeading eyebrow="Delivery" title="Saved addresses">
        <Button onClick={() => setEditing({ ...empty, isDefault: addresses.length === 0 })}>
          <Plus className="h-4 w-4" aria-hidden /> Add address
        </Button>
      </AccountHeading>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-9 w-9" />}
          title="No saved addresses"
          body="Save your home or work address for one-tap checkout."
          action={<Button onClick={() => setEditing({ ...empty, isDefault: true })}>Add your first address</Button>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-chili" aria-hidden />
                <p className="font-display text-xl font-semibold">{a.label}</p>
                {a.isDefault && <Badge tone="dark">Default</Badge>}
              </div>
              <p className="mt-3 text-charcoal/80">
                {a.line1}
                {a.line2 && <>, {a.line2}</>}
                <br />
                {a.city} {a.pincode}
              </p>
              <p className="mt-1 text-sm text-ash">{a.phone}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-cream-300 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setEditing(a)} aria-label={`Edit ${a.label} address`}>
                  <Pencil className="h-4 w-4" aria-hidden /> Edit
                </Button>
                {!a.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => saveAddress({ ...a, isDefault: true })}>
                    Make default
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto text-chili-deep" onClick={() => setToDelete(a)} aria-label={`Delete ${a.label} address`}>
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <AddressForm key={editing.id ?? "new"} draft={editing} onClose={() => setEditing(null)} />}

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete address?"
        description={toDelete ? `${toDelete.label}: ${toDelete.line1}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Keep it
            </Button>
            <Button
              onClick={() => {
                if (toDelete) deleteAddress(toDelete.id);
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-ash">You can always add it again later.</p>
      </Modal>
    </>
  );
}

function AddressForm({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string | null>>>({});

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = {
      line1: validators.required("Street address")(d.line1),
      city: validators.required("City")(d.city),
      pincode: validators.pincode(d.pincode),
      phone: validators.phone(d.phone),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    saveAddress(d);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={draft.id ? "Edit address" : "New address"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="address-form">
            Save address
          </Button>
        </>
      }
    >
      <form id="address-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Label">
          {(p) => (
            <Select {...p} value={d.label} onChange={(e) => set("label", e.target.value)}>
              {["Home", "Work", "Partner", "Other"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Phone" error={errors.phone}>
          {(p) => <Input {...p} type="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} data-autofocus />}
        </Field>
        <Field label="Street address" error={errors.line1} className="sm:col-span-2">
          {(p) => <Input {...p} value={d.line1} onChange={(e) => set("line1", e.target.value)} placeholder="Flat, building, street" />}
        </Field>
        <Field label="Area / landmark" optional className="sm:col-span-2">
          {(p) => <Input {...p} value={d.line2} onChange={(e) => set("line2", e.target.value)} />}
        </Field>
        <Field label="City" error={errors.city}>
          {(p) => <Input {...p} value={d.city} onChange={(e) => set("city", e.target.value)} />}
        </Field>
        <Field label="PIN code" error={errors.pincode}>
          {(p) => <Input {...p} inputMode="numeric" maxLength={6} value={d.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />}
        </Field>
        <Checkbox className="sm:col-span-2" label="Set as default address" checked={d.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />
      </form>
    </Modal>
  );
}
