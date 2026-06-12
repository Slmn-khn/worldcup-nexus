// Server-safe pager: uppercase PREV/NEXT text links that preserve the
// current filter params. No client state — pagination is part of the URL.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { buildQueryString, type RawSearchParams } from "@/lib/search-params";
import { atlas, eyebrowSx, tabularNums, textLinkSx } from "@/theme/tokens";

type VaultPagerProps = {
  basePath: string;
  page: number;
  pageSize: number;
  filteredTotal: number;
  /** Current raw search params — preserved on page links. */
  params: RawSearchParams;
};

function pageHref(
  basePath: string,
  params: RawSearchParams,
  page: number,
): string {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  flat.page = page > 1 ? String(page) : undefined;
  return `${basePath}${buildQueryString(flat)}`;
}

export default function VaultPager({
  basePath,
  page,
  pageSize,
  filteredTotal,
  params,
}: VaultPagerProps) {
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  if (totalPages <= 1) return null;
  const current = Math.min(page, totalPages);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mt: 3,
        pt: 2.5,
        borderTop: `1px solid ${atlas.border}`,
      }}
    >
      {current > 1 ? (
        <Typography
          component={Link}
          href={pageHref(basePath, params, current - 1)}
          sx={textLinkSx}
        >
          ← Previous
        </Typography>
      ) : (
        <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
          ← Previous
        </Typography>
      )}
      <Typography
        sx={{
          ...eyebrowSx,
          ...tabularNums,
          fontSize: "0.7rem",
          color: atlas.textSecondary,
        }}
      >
        Page {current.toLocaleString("en-US")} of{" "}
        {totalPages.toLocaleString("en-US")}
      </Typography>
      {current < totalPages ? (
        <Typography
          component={Link}
          href={pageHref(basePath, params, current + 1)}
          sx={textLinkSx}
        >
          Next →
        </Typography>
      ) : (
        <Typography sx={{ ...eyebrowSx, color: atlas.textMuted }}>
          Next →
        </Typography>
      )}
    </Box>
  );
}
