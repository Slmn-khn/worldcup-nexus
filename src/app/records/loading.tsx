import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function RecordsLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={460} height={24} sx={{ mb: 3 }} />
          <Skeleton
            variant="rounded"
            width="100%"
            height={88}
            sx={{ maxWidth: 860 }}
          />
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
            <Skeleton key={index} variant="rounded" height={120} />
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={280} />
          ))}
        </Box>
      </PageContainer>
    </Box>
  );
}
