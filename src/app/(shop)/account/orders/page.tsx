import type { Metadata } from "next";
import { OrderHistory } from "@/components/account/order-history";

export const metadata: Metadata = { title: "Order history" };

export default function OrdersPage() {
  return <OrderHistory />;
}
