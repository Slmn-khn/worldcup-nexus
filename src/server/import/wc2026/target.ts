// Database-target classification and redaction for import CLIs. Never returns
// or prints credentials — only host, port and database name.

export type TargetKind = "LOCAL" | "STAGING" | "PRODUCTION";

export type TargetSummary = {
  kind: TargetKind;
  host: string;
  port: string;
  database: string;
  /** Safe to print: no user, password or query string. */
  redacted: string;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres", "host.docker.internal"]);

function isLocalHost(host: string): boolean {
  return LOCAL_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".test");
}

/**
 * Classify a connection string. Anything that is not an explicitly local host
 * is treated as STAGING at minimum; known production signals (Supabase/managed
 * hosts, NODE_ENV=production, or an explicit IMPORT_TARGET=production) make it
 * PRODUCTION. Unknown hosts are never assumed to be safe.
 */
export function classifyTarget(
  url: string | undefined,
  env: { NODE_ENV?: string; IMPORT_TARGET?: string } = {},
): TargetSummary {
  if (url === undefined || url.trim() === "") {
    throw new Error("DATABASE_URL is not set.");
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL (value not shown).");
  }
  const host = parsed.hostname.toLowerCase();
  const port = parsed.port || "5432";
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, "")) || "(default)";

  let kind: TargetKind;
  const explicit = env.IMPORT_TARGET?.toLowerCase();
  if (explicit === "production" || env.NODE_ENV === "production") kind = "PRODUCTION";
  else if (isLocalHost(host)) kind = explicit === "staging" ? "STAGING" : "LOCAL";
  else if (/supabase\.(co|com)$|pooler\.supabase|rds\.amazonaws\.com|neon\.tech|vercel-storage/.test(host)) {
    kind = explicit === "staging" ? "STAGING" : "PRODUCTION";
  } else kind = "STAGING";

  return { kind, host, port, database, redacted: `postgresql://***@${host}:${port}/${database}` };
}
