// URL of the disposable integration-test database: WC2026_IT_DATABASE_URL, or
// DATABASE_URL with "_it" appended to the database name.

export function integrationDatabaseUrl(): string {
  if (process.env.WC2026_IT_DATABASE_URL) return process.env.WC2026_IT_DATABASE_URL;
  const base = process.env.DATABASE_URL;
  if (!base) throw new Error("DATABASE_URL is not set.");
  const url = new URL(base);
  url.pathname = `/${url.pathname.replace(/^\//, "")}_it`;
  return url.toString();
}
