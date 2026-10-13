import type { Metadata } from "next";
import { MenuAdmin } from "@/components/admin/menu-admin";

export const metadata: Metadata = { title: "Menu items" };

export default function Page() {
  return <MenuAdmin />;
}
