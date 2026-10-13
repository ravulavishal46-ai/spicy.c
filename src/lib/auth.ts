"use client";

import type { AuthError } from "@supabase/supabase-js";
import { saveProfile } from "./db";
import { DEMO_EMAIL, signIn, signOutLocal, syncOrdersFromDb, toast, userStore } from "./store";
import { supabase } from "./supabase/client";
import type { SpiceLevel } from "./types";

/*
 * Real email sign-in with a one-time code, powered by Supabase Auth.
 * 1. sendEmailCode() asks Supabase to email a 6-digit code.
 * 2. verifyEmailCode() checks it; only a correct code creates a session.
 * Supabase's default email has a sign-in link instead of a code; clicking it
 * also works (the session arrives in the URL and startAuthSync picks it up).
 * To email a code, the templates must include {{ .Token }} (see README).
 */

export type AuthResult = { ok: true } | { ok: false; error: string };

function friendly(error: AuthError | Error | null | undefined, step: "send" | "verify"): string {
  const message = (error?.message ?? "").toLowerCase();
  const status = (error as AuthError | undefined)?.status;
  if (error instanceof TypeError || message.includes("failed to fetch") || message.includes("network")) {
    // The single-file preview inside Claude can't contact outside services at all.
    if (process.env.NEXT_PUBLIC_SPICY_PREVIEW === "1") {
      return "Email sign-in doesn't work inside the Claude preview, which blocks outside connections. Open the website itself (npm run dev, or its online address) to sign in. You can still browse as demo here.";
    }
    return "Couldn't reach the sign-in service. Check your internet connection and try again.";
  }
  if (step === "verify" && (message.includes("expired") || message.includes("invalid") || status === 403)) {
    return "That code is wrong or has expired. Check the latest email, or send a new code.";
  }
  if (status === 429 || message.includes("rate limit") || message.includes("security purposes")) {
    const wait = /after (\d+) seconds?/.exec(error?.message ?? "")?.[1];
    return wait ? `Please wait ${wait} seconds before asking for another code.` : "Too many codes requested. Wait a minute and try again.";
  }
  if (message.includes("not authorized") || message.includes("not allowed")) {
    return "This email can't receive codes yet. The project's built-in email only sends to its Supabase team members — see README to add an email service.";
  }
  if (message.includes("invalid") && message.includes("email")) return "Enter a valid email address.";
  return error?.message || "Something went wrong. Please try again.";
}

/** Step 1: email a one-time code. New emails get an account automatically. */
export async function sendEmailCode(email: string, name: string): Promise<AuthResult> {
  try {
    const { error } = await supabase().auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        data: { name: name.trim() },
        // Where the link in the email lands (must be listed under Auth → URL Configuration).
        emailRedirectTo: typeof window === "undefined" ? undefined : `${window.location.origin}/account`,
      },
    });
    return error ? { ok: false, error: friendly(error, "send") } : { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e as Error, "send") };
  }
}

/** Step 2: check the code. Only a correct code signs the user in with ordering access. */
export async function verifyEmailCode(
  email: string,
  code: string,
  name: string,
  extra: { heatPreference?: SpiceLevel } = {},
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error || !data.session || !data.user) return { ok: false, error: friendly(error, "verify") };
    // Keep the typed name on the Supabase account too (best effort).
    void supabase().auth.updateUser({ data: { name: name.trim() } });
    const verifiedEmail = data.user.email ?? email.trim();
    signIn({ name, email: verifiedEmail, verified: true, ...extra });
    // Record the registration and load this customer's orders (best effort).
    await saveProfile({ name, email: verifiedEmail, heatPreference: extra.heatPreference });
    await syncOrdersFromDb();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e as Error, "verify") };
  }
}

/** Browse-only demo: can see everything, can't add to the bag or order. */
export function signInDemo(name: string) {
  signIn({ name, email: DEMO_EMAIL, verified: false });
}

export async function signOut() {
  const wasVerified = Boolean(userStore.get()?.verified);
  signOutLocal();
  toast({ title: "Signed out" });
  if (wasVerified) {
    try {
      await supabase().auth.signOut();
    } catch {
      // Already signed out locally; ignore network errors.
    }
  }
}

/**
 * Keeps the on-screen user in step with the real Supabase session:
 * - a verified user whose session ended (expired, signed out elsewhere) loses ordering access;
 * - a valid session restores the verified user after a reload.
 */
export function startAuthSync() {
  const client = supabase();
  const apply = (session: Awaited<ReturnType<typeof client.auth.getSession>>["data"]["session"]) => {
    const current = userStore.get();
    if (session?.user?.email) {
      const email = session.user.email;
      if (!current || current.email.toLowerCase() !== email.toLowerCase() || !current.verified) {
        const metaName = (session.user.user_metadata?.name as string | undefined)?.trim();
        const name = current?.email.toLowerCase() === email.toLowerCase() ? current.name : metaName || email.split("@")[0];
        signIn({ name, email, verified: true });
        // Signed in by clicking the email link: record the registration too.
        void saveProfile({ name, email });
      }
      void syncOrdersFromDb();
    } else if (current?.verified) {
      signOutLocal();
    }
  };
  client.auth
    .getSession()
    .then(({ data }) => apply(data.session))
    .catch(() => {
      // Offline or blocked: keep the local state; ordering stays as it was.
    });
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "SIGNED_IN") apply(session);
  });
  return () => data.subscription.unsubscribe();
}
