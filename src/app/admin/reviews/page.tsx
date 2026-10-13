import type { Metadata } from "next";
import { ReviewsAdmin } from "@/components/admin/people-admin";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <ReviewsAdmin />;
}
