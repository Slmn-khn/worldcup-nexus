import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function CountriesLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 6, md: 9 } }}>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={340} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={460} height={24} />
        </PageContainer>
      </Box>
      <PageContainer sx={{ py: 5 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
          }}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={130} />
          ))}
        </Box>
      </PageContainer>
    </Box>
  );
}
