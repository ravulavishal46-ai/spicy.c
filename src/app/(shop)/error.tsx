"use client";

import { ErrorState } from "@/components/ui/misc";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x py-16">
      <ErrorState
        title="Something boiled over"
        body="An unexpected error happened while loading this page. Try again — if it keeps happening, head back to the menu."
        onRetry={reset}
      />
    </div>
  );
}
