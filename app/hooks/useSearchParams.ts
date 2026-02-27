"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams as useNextSearchParams, useRouter, usePathname } from "next/navigation";

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  propertyType?: string[];
  tenure?: string;
  keywords?: string;
  addedSince?: string;
  includeArchived?: boolean;
  sortBy?: string;
  view?: "grid" | "list" | "map";
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useNextSearchParams();

  const filters = useMemo<SearchFilters>(() => {
    return {
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      beds: searchParams.get("beds") ? Number(searchParams.get("beds")) : undefined,
      propertyType: searchParams.get("propertyType")?.split(","),
      tenure: searchParams.get("tenure") || undefined,
      keywords: searchParams.get("keywords") || undefined,
      addedSince: searchParams.get("addedSince") || undefined,
      includeArchived: searchParams.get("includeArchived") === "true",
      sortBy: searchParams.get("sortBy") || "newest",
      view: (searchParams.get("view") as "grid" | "list" | "map") || "grid",
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || value === false) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            params.delete(key);
          } else {
            params.set(key, value.join(","));
          }
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "sortBy" || key === "view") return false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "" && value !== false;
    });
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
  };
}
