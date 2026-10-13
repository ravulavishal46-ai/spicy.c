import type { Metadata } from "next";
import { SettingsAdmin } from "@/components/admin/insights-admin";

export const metadata: Metadata = { title: "Settings & audit" };

export default function Page() {
  return <SettingsAdmin />;
}
