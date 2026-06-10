import Container from "@mui/material/Container";
import type { ContainerProps } from "@mui/material/Container";

type PageContainerProps = {
  children: React.ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  /** Polymorphic root element, e.g. "section" for anchored page sections. */
  component?: React.ElementType;
} & Omit<ContainerProps, "maxWidth" | "children">;

export default function PageContainer({
  children,
  maxWidth = "lg",
  ...props
}: PageContainerProps) {
  return (
    <Container maxWidth={maxWidth} {...props}>
      {children}
    </Container>
  );
}
