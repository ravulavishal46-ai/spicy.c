import type { Metadata } from "next";
import { CouponsAdmin } from "@/components/admin/people-admin";

export const metadata: Metadata = { title: "Coupons" };

export default function Page() {
  return <CouponsAdmin />;
}
