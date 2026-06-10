import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function MatchDetailLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 5, md: 8 } }}>
          <Skeleton variant="text" width={260} height={20} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <Skeleton variant="rounded" width={180} height={24} />
            <Skeleton variant="rounded" width={100} height={24} />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              py: 2,
            }}
          >
            <Skeleton variant="text" width={180} height={42} />
            <Skeleton variant="text" width={120} height={72} />
            <Skeleton variant="text" width={180} height={42} />
          </Box>
        </PageContainer>
      </Box>
      <PageContainer sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
            mb: 4,
          }}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={72} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={360} />
      </PageContainer>
    </Box>
  );
}
