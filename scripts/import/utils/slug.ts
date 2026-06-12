// Slug helpers. Slugs must be stable across re-imports (docs/DATA_MODEL.md),
// so collisions are resolved deterministically with the source id as suffix.

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics after NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Claims unique slugs within one entity type. The first claimant of a base
 * slug keeps it; later collisions get a `-<sourceId>` suffix. Callers must
 * process rows in a deterministic order (sorted by source id) so the same
 * input always produces the same slugs.
 */
export class SlugRegistry {
  private used = new Set<string>();

  claim(base: string, sourceId: string): string {
    const fallback = slugify(sourceId);
    const slug = base.length > 0 ? base : fallback;
    if (!this.used.has(slug)) {
      this.used.add(slug);
      return slug;
    }
    const suffixed = `${slug}-${fallback}`;
    if (this.used.has(suffixed)) {
      throw new Error(
        `Slug collision could not be resolved: ${suffixed} (duplicate source id?)`,
      );
    }
    this.used.add(suffixed);
    return suffixed;
  }
}
