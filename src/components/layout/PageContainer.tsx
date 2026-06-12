import Container from "@mui/material/Container";
import type { ContainerProps } from "@mui/material/Container";

type PageContainerProps = {
  children: React.ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  /** Polymorphic root element, e.g. "section" for anchored page sections. */
  component?: React.ElementType;
} & Omit<ContainerProps, "maxWidth" | "children">;

// Vault container: ~1440px max content width with consistent gutters.
export default function PageContainer({
  children,
  maxWidth = false,
  sx,
  ...props
}: PageContainerProps) {
  return (
    <Container
      maxWidth={maxWidth}
      {...props}
      sx={{ maxWidth: 1440, px: { xs: 2.5, sm: 4, md: 6 }, ...sx }}
    >
      {children}
    </Container>
  );
}
