// Pure helper: derive up-to-two-letter initials from a person's name for the
// portrait fallback. Server-safe and dependency-free so it can be unit-tested.

/**
 * Initials for a name: first letter of the first and last word, uppercased.
 * Single-word names yield one letter. Returns "" for empty/blank input.
 * Diacritics are preserved (uppercased), e.g. "Pelé" → "P".
 */
export function getInitials(name: string | null | undefined): string {
  if (name == null) return "";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word !== "");
  if (words.length === 0) return "";
  const first = words[0]!.charAt(0);
  if (words.length === 1) return first.toUpperCase();
  const last = words[words.length - 1]!.charAt(0);
  return `${first}${last}`.toUpperCase();
}
