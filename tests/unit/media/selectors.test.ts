import { describe, expect, it } from "vitest";
import {
  compareMediaLinks,
  resolveMediaUrl,
  selectPrimaryMedia,
  sortMediaLinks,
} from "../../../src/server/media/selectors";

describe("resolveMediaUrl", () => {
  it("prefers optimized → storage → original", () => {
    expect(
      resolveMediaUrl({
        optimizedUrl: "opt",
        storageUrl: "store",
        originalUrl: "orig",
      }),
    ).toBe("opt");
    expect(
      resolveMediaUrl({ storageUrl: "store", originalUrl: "orig" }),
    ).toBe("store");
    expect(resolveMediaUrl({ originalUrl: "orig" })).toBe("orig");
  });

  it("returns null when no usable url exists", () => {
    expect(resolveMediaUrl({})).toBeNull();
    expect(
      resolveMediaUrl({ optimizedUrl: "  ", storageUrl: null, originalUrl: "" }),
    ).toBeNull();
  });
});

describe("media ordering", () => {
  const base = { createdAt: "2024-01-01T00:00:00.000Z" };

  it("orders primary first, then priority asc, then createdAt asc", () => {
    const links = [
      { id: "c", isPrimary: false, priority: 50, createdAt: base.createdAt },
      { id: "a", isPrimary: true, priority: 100, createdAt: base.createdAt },
      { id: "b", isPrimary: false, priority: 10, createdAt: base.createdAt },
    ];
    expect(sortMediaLinks(links).map((l) => l.id)).toEqual(["a", "b", "c"]);
  });

  it("compareMediaLinks breaks priority ties by createdAt", () => {
    const older = {
      isPrimary: false,
      priority: 10,
      createdAt: "2020-01-01T00:00:00.000Z",
    };
    const newer = {
      isPrimary: false,
      priority: 10,
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    expect(compareMediaLinks(older, newer)).toBeLessThan(0);
  });
});

describe("selectPrimaryMedia", () => {
  it("returns null for an empty list (no media exists)", () => {
    expect(selectPrimaryMedia([])).toBeNull();
  });
});
