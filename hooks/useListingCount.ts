"use client";

import * as React from "react";
import { loadListingCount } from "@/lib/home-search";
import type { PropertyDepartment } from "@/lib/property-search/types";

export function useListingCount(department: PropertyDepartment): number | undefined {
  const [counts, setCounts] = React.useState<
    Partial<Record<PropertyDepartment, number>>
  >({});
  const hasCount = counts[department] !== undefined;

  React.useEffect(() => {
    if (hasCount) return;
    const controller = new AbortController();
    const updateCount = async () => {
      try {
        const total = await loadListingCount(fetch, department, controller.signal);
        setCounts((current) => ({ ...current, [department]: total }));
      } catch {
        // The count is a nicety: without it the line stays hidden and search still works.
      }
    };
    void updateCount();
    return () => controller.abort();
  }, [department, hasCount]);

  return counts[department];
}
