// Generic Vault card: surface-card panel, zero radius, 1px hairline, with
// optional top color band and label/title/body/metadata/action slots.
// Entity cards (tournament, match, …) compose this anatomy directly where
// they need more control; VaultCard covers the common case.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import Link from "@/components/Link";
import { atlas, eyebrowSx, interactiveCardSx, textLinkSx } from "@/theme/tokens";

type VaultCardProps = {
  /** Optional top media/color band content (rendered on canvasSoft). */
  band?: React.ReactNode;
  /** Uppercase eyebrow label. */
  label?: string;
  title?: string;
  children?: React.ReactNode;
  /** Small muted metadata line under the body. */
  metadata?: string;
  /** Uppercase text-link action, e.g. { label: "View tournament", href }. */
  action?: { label: string; href: string };
  sx?: SxProps<Theme>;
};

export default function VaultCard({
  band,
  label,
  title,
  children,
  metadata,
  action,
  sx,
}: VaultCardProps) {
  return (
    <Box
      sx={{
        bgcolor: atlas.surface1,
        border: `1px solid ${atlas.border}`,
        display: "flex",
        flexDirection: "column",
        ...interactiveCardSx,
        ...sx,
      }}
    >
      {band ? (
        <Box
          sx={{
            bgcolor: atlas.canvasSoft,
            borderBottom: `1px solid ${atlas.border}`,
          }}
        >
          {band}
        </Box>
      ) : null}
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {label ? (
          <Typography
            component="p"
            sx={{ ...eyebrowSx, color: atlas.textMuted, mb: 1 }}
          >
            {label}
          </Typography>
        ) : null}
        {title ? (
          <Typography variant="h4" sx={{ fontSize: "1.4rem", mb: 1 }}>
            {title}
          </Typography>
        ) : null}
        {children}
        {metadata ? (
          <Typography
            variant="caption"
            sx={{ color: atlas.textMuted, display: "block", mt: 1.5 }}
          >
            {metadata}
          </Typography>
        ) : null}
        {action ? (
          <Box
            sx={{
              mt: "auto",
              pt: 2.5,
            }}
          >
            <Typography
              component={Link}
              href={action.href}
              sx={{
                ...textLinkSx,
                pt: 2,
                borderTop: `1px solid ${atlas.border}`,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {action.label} <span aria-hidden>→</span>
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
