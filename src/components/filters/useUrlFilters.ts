"use client";

// URL-driven filter state for archive pages. Filters live entirely in the
// query string so every filtered view is bookmarkable and shareable.

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Current value of a param ("" when absent). */
  const get = React.useCallback(
    (key: string): string => searchParams.get(key) ?? "",
    [searchParams],
  );

  /**
   * Sets/clears params (null or "" clears) and navigates. Unrelated params
   * are preserved; `page` resets to 1 whenever a filter changes.
   */
  const update = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!("page" in updates)) {
        params.delete("page");
      }
      const query = params.toString();
      router.push(query === "" ? pathname : `${pathname}?${query}`, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );

  /** Clears the given params (or, with no argument, every param). */
  const clear = React.useCallback(
    (keys?: string[]) => {
      if (keys === undefined) {
        router.push(pathname, { scroll: false });
        return;
      }
      update(Object.fromEntries(keys.map((key) => [key, null])));
    },
    [router, pathname, update],
  );

  return { get, update, clear };
}
