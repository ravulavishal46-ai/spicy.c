import type { Metadata } from "next";
import { InventoryAdmin } from "@/components/admin/people-admin";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return <InventoryAdmin />;
}
