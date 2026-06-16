import type { NextConfig } from "next";

// Baseline security headers (Checkpoint 8B, P0.2). The CSP ships as
// Report-Only first — MUI/Emotion injects runtime <style> tags and the Next
// App Router emits inline bootstrap scripts, so both need 'unsafe-inline'
// until a nonce-based CSP is intentionally designed (hardening plan P2.1).
// Enforcement is a later checkpoint after observing violations.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Keep in sync with images.remotePatterns below. Phase 1 renders no remote
  // media, but allowing the trusted media hosts here avoids CSP reports once
  // approved assets exist. Never widen this to a wildcard.
  "img-src 'self' data: https://upload.wikimedia.org https://commons.wikimedia.org",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Content-Security-Policy-Report-Only", value: CONTENT_SECURITY_POLICY },
  // HSTS only in production — it must never apply to local http:// dev, and
  // it presumes the deployed site is HTTPS-only (confirmed at deploy time).
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Media layer (Phase 1): explicit allow-list of trusted image hosts for
  // next/image. No wildcards — arbitrary hosts must never be loadable. Phase 1
  // renders no remote media by default (the media tables ship empty and the
  // curated example carries no URLs), so these are dormant until approved
  // assets exist. Add future hosts here (e.g. a Supabase storage subdomain or
  // res.cloudinary.com) and remember to widen the CSP `img-src` below.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      // Cloudinary is not used yet; uncomment when an account is configured.
      // { protocol: "https", hostname: "res.cloudinary.com" },
      // Supabase storage host is added once the project URL is known, e.g.
      // { protocol: "https", hostname: "<project>.supabase.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
