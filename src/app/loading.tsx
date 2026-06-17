// Route-level loading — themed cyan spinner via the shared LoadingState.

import LoadingState from "@/components/ui/LoadingState";

export default function RootLoading() {
  return <LoadingState fullPage message="Loading the archive…" />;
}
