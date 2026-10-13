import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin prototype", template: "%s · SPICY Admin" },
  robots: { index: false, follow: false },
};

/**
 * PROTOTYPE ONLY: this route has no authentication or server-side authorization.
 * Before going live, protect /admin on the server (e.g. a session check in a
 * Next.js `proxy` + per-request role checks in every data mutation).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
