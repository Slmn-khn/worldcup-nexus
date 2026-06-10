import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function PlayerProfileLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 5, md: 8 } }}>
          <Skeleton variant="text" width={240} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={360} height={56} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={420} height={24} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Skeleton variant="rounded" width={170} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </Box>
        </PageContainer>
      </Box>
      <PageContainer sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            mb: 4,
          }}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={100} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={300} />
      </PageContainer>
    </Box>
  );
}
