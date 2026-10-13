import type { Metadata } from "next";
import { CustomersAdmin } from "@/components/admin/people-admin";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return <CustomersAdmin />;
}
