import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function TournamentDetailLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 5, md: 8 } }}>
          <Skeleton variant="text" width={220} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="text" width={140} height={18} />
          <Skeleton variant="text" width="60%" height={56} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={320} height={24} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Skeleton variant="rounded" width={180} height={32} />
            <Skeleton variant="rounded" width={160} height={32} />
          </Box>
        </PageContainer>
      </Box>
      <PageContainer sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            mb: 4,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={110} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={320} />
      </PageContainer>
    </Box>
  );
}
