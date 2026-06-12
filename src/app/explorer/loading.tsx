import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import PageContainer from "@/components/layout/PageContainer";

export default function ExplorerLoading() {
  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <PageContainer sx={{ py: { xs: 6, md: 8 } }}>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={280} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={520} height={24} />
        </PageContainer>
      </Box>
      <PageContainer sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          <Skeleton variant="rounded" width={180} height={40} />
          <Skeleton variant="rounded" width={170} height={40} />
          <Skeleton variant="rounded" width={130} height={40} />
        </Box>
        <Skeleton variant="rounded" height={560} />
      </PageContainer>
    </Box>
  );
}
