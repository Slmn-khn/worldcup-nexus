import Container from "@mui/material/Container";
import type { ContainerProps } from "@mui/material/Container";

type PageContainerProps = {
  children: React.ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
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
