import type { Metadata } from "next";
import { Profile } from "@/components/account/profile";

export const metadata: Metadata = { title: "Profile" };

export default function AccountPage() {
  return <Profile />;
}
