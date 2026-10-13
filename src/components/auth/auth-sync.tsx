"use client";

import { useEffect } from "react";
import { startAuthSync } from "@/lib/auth";

/** Mount once: keeps the signed-in user in step with the Supabase session. */
export function AuthSync() {
  useEffect(() => startAuthSync(), []);
  return null;
}
