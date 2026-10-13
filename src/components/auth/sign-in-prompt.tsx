"use client";

import { usePathname, useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { signInPromptStore, useUser } from "@/lib/store";

/** Asks visitors and demo users to verify their email before ordering. */
export function SignInPrompt() {
  const { open, reason } = signInPromptStore.useStore();
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const close = () => signInPromptStore.set({ open: false, reason: "" });

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Verify your email to order"
      description={`Browsing is open to everyone. To ${reason || "order"}, sign in with your email — we'll send you a one-time code.`}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Keep browsing
          </Button>
          <Button
            data-autofocus
            onClick={() => {
              close();
              router.push(`/login?next=${encodeURIComponent(pathname)}`);
            }}
          >
            <MailCheck className="h-4 w-4" aria-hidden /> Sign in with email
          </Button>
        </>
      }
    >
      <p className="text-sm text-ash">
        {user && !user.verified
          ? `You're using the demo as ${user.name}. Demo accounts can explore every dish but can't add to the bag or place orders.`
          : "It takes less than a minute: enter your name and email, then type the code from your inbox."}
      </p>
    </Modal>
  );
}
