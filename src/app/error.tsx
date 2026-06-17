"use client";

// App-level error boundary. Generic on purpose — no stack traces or error
// details are shown to users (only the opaque digest reference). Themed via the
// shared ErrorState + NeonButton.

import NeonButton from "@/components/ui/NeonButton";
import ErrorState from "@/components/ui/ErrorState";
import Link from "@/components/Link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong"
      description={
        <>
          An unexpected error occurred while loading this page. Please try
          again.
          {error.digest ? ` (ref: ${error.digest})` : ""}
        </>
      }
      actions={
        <>
          <NeonButton neon="gold" onClick={reset}>
            Try again
          </NeonButton>
          <NeonButton neon="outline" component={Link} href="/">
            Back home
          </NeonButton>
        </>
      }
    />
  );
}
