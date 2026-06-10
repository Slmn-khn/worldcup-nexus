import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import AppShell from "@/components/layout/AppShell";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
