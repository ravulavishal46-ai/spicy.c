"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Supabase project for SPICY. The publishable key is designed to be public
 * (it only allows what the database's security rules permit), so it is safe
 * to ship in the browser. Override both with .env.local if you move projects.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hdzzjojyqjxssdnzpbca.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_8cfesvP-mrRd5EKKRh_oHg_vjgOAoeF";

let client: SupabaseClient | null = null;

export function supabase() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "spicy-auth" },
    });
  }
  return client;
}
