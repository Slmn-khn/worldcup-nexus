// Privacy page (Checkpoint 8B, P1.5). Plain statement of what the site
// does and does not collect — there are no accounts, cookies, or analytics.

import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import PageContainer from "@/components/layout/PageContainer";
import VaultPageHeader from "@/components/vault/VaultPageHeader";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "WORLDCUP Nexus privacy statement: no accounts, no cookies, no analytics — only public historical football data.",
};

export default function PrivacyPage() {
  return (
    <Box>
      <VaultPageHeader
        eyebrow="Your data stays yours"
        title="Privacy"
        lede="WORLDCUP Nexus is a read-only historical archive. It collects as close to nothing as a website can."
      />

      <PageContainer component="section" sx={{ py: { xs: 4, md: 5 } }}>
        <SectionHeading title="What This Site Collects" />
        <Stack component="ul" spacing={1} sx={{ pl: 3, m: 0, maxWidth: 760 }}>
          {[
            "WORLDCUP Nexus does not require user accounts. There is nothing to sign up for and no personal profile is ever created.",
            "WORLDCUP Nexus does not currently use cookies.",
            "WORLDCUP Nexus does not currently use analytics or tracking of any kind.",
            "Standard server logs (such as request paths and error diagnostics) may be kept briefly for operating and protecting the service.",
          ].map((item) => (
            <Typography
              key={item}
              component="li"
              variant="body1"
              sx={{ color: "text.secondary" }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
      </PageContainer>

      <PageContainer component="section" sx={{ py: { xs: 4, md: 5 } }}>
        <SectionHeading title="What This Site Displays" />
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 760 }}
        >
          The site displays public historical football data — tournaments,
          matches, players, and records from past FIFA World Cups. Data source
          and license details are on the{" "}
          <Typography
            component={Link}
            href="/sources"
            sx={{ color: "primary.main" }}
          >
            Sources
          </Typography>{" "}
          page.
        </Typography>
      </PageContainer>

      <PageContainer component="section" sx={{ py: { xs: 4, md: 5 } }}>
        <SectionHeading title="If This Ever Changes" />
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 760 }}
        >
          If analytics or user accounts are ever added in the future, this page
          will be updated first to explain exactly what is collected and why.
        </Typography>
      </PageContainer>

      <PageContainer component="section" sx={{ py: { xs: 4, md: 5 } }}>
        <SectionHeading title="Feedback Submissions" />
        <Stack spacing={2} sx={{ maxWidth: 760 }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            When users submit feedback, WORLDCUP Nexus may store the feedback
            message, optional contact details, related page URL, and limited
            abuse-prevention metadata such as hashed IP/user-agent signals. This
            information is used to improve the archive, prevent spam, and follow
            up only when appropriate.
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 3, m: 0 }}>
            {[
              "Providing an email address is optional — it is only used if a reply is appropriate.",
              "Please do not submit private personal information in feedback.",
              "Limited technical data is used solely for spam and abuse prevention.",
              "Raw IP addresses are not stored — only salted, hashed signals are kept.",
              "Feedback is private by default and reviewed before any action is taken.",
            ].map((item) => (
              <Typography
                key={item}
                component="li"
                variant="body1"
                sx={{ color: "text.secondary" }}
              >
                {item}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </PageContainer>

      <PageContainer
        component="section"
        sx={{ py: { xs: 4, md: 5 }, pb: { xs: 7, md: 9 } }}
      >
        <SectionHeading title="Independent Project" />
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 760 }}
        >
          {siteConfig.disclaimer}
        </Typography>
      </PageContainer>
    </Box>
  );
}
