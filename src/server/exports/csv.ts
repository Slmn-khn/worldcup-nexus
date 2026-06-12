// Minimal CSV serialization — no dependency needed for flat DTO rows.

// Spreadsheet formula-injection guard (Checkpoint 8B, P0.3): Excel/Sheets
// may evaluate cells starting with these characters as formulas. Scores like
// "3–2" use an en dash (not ASCII "-") and are unaffected.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/**
 * Escapes a single CSV cell (quotes, commas, newlines); null/undefined → "".
 * Cells that would be interpreted as spreadsheet formulas are neutralized
 * with a leading single quote before the normal escaping.
 */
export function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;
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
