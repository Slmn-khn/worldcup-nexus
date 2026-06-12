import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function CountryProfileLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 5, md: 8 } }}>
          <Skeleton variant="text" width={240} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="text" width={130} height={18} />
          <Skeleton variant="text" width={320} height={56} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={380} height={24} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={110} height={32} />
            <Skeleton variant="rounded" width={150} height={32} />
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
            <Skeleton key={index} variant="rounded" height={100} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={340} />
      </PageContainer>
    </Box>
  );
}
