// 404 — themed via the shared ErrorState + NeonButton. Keeps the existing
// recovery links (home, tournaments, explorer).

import NeonButton from "@/components/ui/NeonButton";
import ErrorState from "@/components/ui/ErrorState";
import Link from "@/components/Link";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="Page not found"
      description="That page is not in the archive. Head back to the archive or explore the data directly."
      actions={
        <>
          <NeonButton neon="gold" component={Link} href="/">
            Back to archive
          </NeonButton>
          <NeonButton neon="outline" component={Link} href="/tournaments">
            Tournaments
          </NeonButton>
          <NeonButton neon="outline" component={Link} href="/explorer">
            Data Explorer
          </NeonButton>
        </>
      }
    />
  );
}
