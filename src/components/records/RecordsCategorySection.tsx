import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import EmptyState from "@/components/ui/EmptyState";
import LeaderboardTable from "./LeaderboardTable";
import StaggerContainer from "@/components/motion/StaggerContainer";
import type { RecordLeaderboardDto } from "@/server/queries/types";

export default function RecordsCategorySection({
  id,
  title,
  description,
  leaderboards,
}: {
  id: string;
  title: string;
  description: string;
  leaderboards: RecordLeaderboardDto[];
}) {
  const populated = leaderboards.filter(
    (leaderboard) => leaderboard.items.length > 0,
  );

  return (
    <PageContainer
      component="section"
      id={id}
      sx={{ py: { xs: 4, md: 5 }, scrollMarginTop: 96 }}
    >
      <SectionHeading title={title} subtitle={description} />
      {populated.length > 0 ? (
        <StaggerContainer
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          {populated.map((leaderboard) => (
            <LeaderboardTable key={leaderboard.key} leaderboard={leaderboard} />
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No records available"
          description="The imported dataset does not contain the data needed for this category yet."
        />
      )}
    </PageContainer>
  );
}
