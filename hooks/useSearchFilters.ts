"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { LegacySearchFilters as SearchFilters } from "../lib/property-search/ui-options";
import {
  filtersToLegacySearchParams,
  hasActiveLegacyFilters,
  parseLegacySearchParams,
} from "../lib/property-search/legacy-search-query";

// ============================================
// Types
// ============================================

interface UseSearchFiltersOptions {
  debounceMs?: number;
}

interface UseSearchFiltersReturn {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  isLoading: boolean;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Parse URL search params into filter state
 */
function parseSearchParams(searchParams: URLSearchParams): SearchFilters {
  return parseLegacySearchParams(searchParams);
}

/**
 * Convert filter state to URL search params
 */
function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  return filtersToLegacySearchParams(filters);
}

/**
 * Check if any filters are active
 */
function hasActiveFilters(filters: SearchFilters): boolean {
  return hasActiveLegacyFilters(filters);
}

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// Main Hook
// ============================================

export function useSearchFilters(options: UseSearchFiltersOptions = {}): UseSearchFiltersReturn {
  const { debounceMs = 300 } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = React.useRef(true);
  const lastUpdatedFilters = React.useRef<string>("");

  // Parse initial filters from URL
  const [filters, setFiltersState] = React.useState<SearchFilters>(() => {
    return parseSearchParams(searchParams);
  });

  // Loading state for filter application
  const [isLoading, setIsLoading] = React.useState(false);

  // Debounced filters for URL updates
  const debouncedFilters = useDebounce(filters, debounceMs);

  // Update URL when debounced filters change (but not on initial mount)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Prevent updating if filters haven't actually changed
    const filtersString = JSON.stringify(debouncedFilters);
    if (filtersString === lastUpdatedFilters.current) {
      return;
    }
    lastUpdatedFilters.current = filtersString;

    const params = filtersToSearchParams(debouncedFilters);
    const queryString = params.toString();
    
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use replace to avoid adding to history stack on every filter change
    router.replace(url, { scroll: false });
    
    // Simulate loading state for better UX
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    
    return () => clearTimeout(timer);
  }, [debouncedFilters, pathname, router]);

  // Sync filters with URL changes (e.g., back/forward navigation) - but not on mount
  React.useEffect(() => {
    if (isInitialMount.current) return;
    
    const urlFilters = parseSearchParams(searchParams);
    const urlFiltersString = JSON.stringify(urlFilters);
    const currentFiltersString = JSON.stringify(filters);
    
    // Only update if URL filters are different from current state
    if (urlFiltersString !== currentFiltersString) {
      setFiltersState(urlFilters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Update filters (merges with existing filters)
   */
  const setFilters = React.useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState((prev) => {
      const updated = { ...prev };

      // Handle special case for features (merge instead of replace)
      if (newFilters.features) {
        updated.features = { ...prev.features, ...newFilters.features };
      }

      // Apply all other filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (key !== "features") {
          if (value === undefined) {
            delete (updated as Record<string, unknown>)[key];
          } else {
            (updated as Record<string, unknown>)[key] = value;
          }
        }
      });

      return updated;
    });
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = React.useCallback(() => {
    setFiltersState({});
  }, []);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(filters),
    isLoading,
  };
}

// ============================================
// Export utility functions
// ============================================

export { parseSearchParams, filtersToSearchParams, hasActiveFilters };
