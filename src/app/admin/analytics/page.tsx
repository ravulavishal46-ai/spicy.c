import type { Metadata } from "next";
import { AnalyticsAdmin } from "@/components/admin/insights-admin";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return <AnalyticsAdmin />;
}
