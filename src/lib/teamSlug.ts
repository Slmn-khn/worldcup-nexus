// Stable team slug for fixture rows. Mirrors the import slugify rules
// (scripts/import/utils/slug.ts) so a fixture's team can line up with an
// archive Country/Team slug where one exists. Pure and dependency-free so it
// is unit-testable and safe to run under both Next and tsx.
//
// Fixture team names can also be knockout placeholders ("Winner Group A",
// "W73", "1A"). Those slugify cleanly too; they are never invented data —
// just the source's own bracket tokens preserved as a slug.

export function teamSlug(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics after NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? null : slug;
}
