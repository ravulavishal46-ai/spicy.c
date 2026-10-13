import type { Metadata } from "next";
import { Addresses } from "@/components/account/addresses";

export const metadata: Metadata = { title: "Saved addresses" };

export default function AddressesPage() {
  return <Addresses />;
}
