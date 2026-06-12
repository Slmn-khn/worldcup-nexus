import type { Metadata } from "next";
import { Inter, Saira_Condensed } from "next/font/google";
import { Providers } from "./providers";
import AppShell from "@/components/layout/AppShell";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Vault display voice: condensed uppercase headlines, scorelines, and big
// numbers (Checkpoint 7C Revised — World Cup Vault editorial system).
const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.siteName,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.siteName,
  creator: siteConfig.siteName,
  keywords: [
    "World Cup",
    "football",
    "soccer",
    "history",
    "archive",
    "tournaments",
    "statistics",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: siteConfig.siteName,
    title: siteConfig.siteName,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.siteName,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${saira.variable}`}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
