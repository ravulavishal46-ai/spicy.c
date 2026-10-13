import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderTracker } from "@/components/account/order-tracker";

export const metadata: Metadata = { title: "Track order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <OrderTracker id={decodeURIComponent(id)} />
    </Suspense>
  );
}
