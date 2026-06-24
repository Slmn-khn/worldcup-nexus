// Feedback & suggestions page. Server component: it validates any prefill
// query params (?type=...&pageUrl=...) and hands a safe prefill to the client
// form. All submission handling happens in POST /api/feedback.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import PageHero from "@/components/ui/PageHero";
import PageShell from "@/components/ui/PageShell";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackGuidelines from "@/components/feedback/FeedbackGuidelines";
import { parseFeedbackQueryParams } from "@/server/feedback/validation";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Send thoughtful feedback, feature ideas, bug reports, and data corrections to help improve the WORLDCUP Nexus archive.",
};

type FeedbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FeedbackPage({
  searchParams,
}: FeedbackPageProps) {
  const params = await searchParams;
  const get = (key: string): string | null => {
    const value = params[key];
    return typeof value === "string" ? value : null;
  };
  const prefill = parseFeedbackQueryParams(get);

  return (
    <Box>
      <PageHero
        eyebrow="Help us improve"
        title="Help Improve WORLDCUP Nexus"
        subtitle="Found incorrect data, have a feature idea, or noticed something that could be better? Send thoughtful feedback to help improve the archive for football fans."
      />

      <PageShell>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.6fr) minmax(0, 1fr)",
            },
            alignItems: "start",
          }}
        >
          <FeedbackForm prefill={prefill} />
          <FeedbackGuidelines />
        </Box>
      </PageShell>
    </Box>
  );
}
