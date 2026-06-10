// Minimal CSV serialization — no dependency needed for flat DTO rows.

/** Escapes a single CSV cell (quotes, commas, newlines); null/undefined → "". */
export function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Builds a CSV string with a stable header order. `rows` are objects read
 * via the header keys, so column order always matches the header row.
 */
export function toCsv<T extends Record<string, unknown>>(
  headers: { key: keyof T & string; label: string }[],
  rows: T[],
): string {
  const lines = [headers.map((header) => toCsvValue(header.label)).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => toCsvValue(row[header.key])).join(","));
  }
  return `${lines.join("\r\n")}\r\n`;
}
