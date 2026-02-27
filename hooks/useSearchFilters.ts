"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SearchFilters } from "../components/property/AdvancedSearch";

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
  const filters: SearchFilters = {};

  // Location
  const location = searchParams.get("location");
  if (location) filters.location = location;

  // Radius
  const radius = searchParams.get("radius");
  if (radius) filters.radius = parseFloat(radius);

  // Price
  const minPrice = searchParams.get("minPrice");
  if (minPrice) filters.minPrice = parseInt(minPrice, 10);

  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);

  // Bedrooms
  const minBeds = searchParams.get("minBeds");
  if (minBeds) filters.minBeds = parseInt(minBeds, 10);

  const maxBeds = searchParams.get("maxBeds");
  if (maxBeds) filters.maxBeds = parseInt(maxBeds, 10);

  // Bathrooms
  const minBaths = searchParams.get("minBaths");
  if (minBaths) filters.minBaths = parseInt(minBaths, 10);

  const maxBaths = searchParams.get("maxBaths");
  if (maxBaths) filters.maxBaths = parseInt(maxBaths, 10);

  // Property Type
  const propertyType = searchParams.get("propertyType");
  if (propertyType) filters.propertyType = propertyType.split(",");

  // Tenure
  const tenure = searchParams.get("tenure");
  if (tenure) filters.tenure = tenure.split(",");

  // Features
  const features: SearchFilters["features"] = {};
  if (searchParams.get("garden") === "true") features.garden = true;
  if (searchParams.get("parking") === "true") features.parking = true;
  if (searchParams.get("garage") === "true") features.garage = true;
  if (searchParams.get("conservatory") === "true") features.conservatory = true;
  if (searchParams.get("fireplace") === "true") features.fireplace = true;
  if (searchParams.get("periodFeatures") === "true") features.periodFeatures = true;
  if (searchParams.get("newBuild") === "true") features.newBuild = true;
  if (searchParams.get("chainFree") === "true") features.chainFree = true;
  if (searchParams.get("virtualTour") === "true") features.virtualTour = true;
  if (searchParams.get("videoTour") === "true") features.videoTour = true;
  
  if (Object.keys(features).length > 0) {
    filters.features = features;
  }

  // Sort
  const sortBy = searchParams.get("sortBy");
  if (sortBy) {
    filters.sortBy = sortBy as SearchFilters["sortBy"];
  }

  return filters;
}

/**
 * Convert filter state to URL search params
 */
function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Location
  if (filters.location) params.set("location", filters.location);

  // Radius
  if (filters.radius !== undefined) params.set("radius", filters.radius.toString());

  // Price
  if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());

  // Bedrooms
  if (filters.minBeds !== undefined) params.set("minBeds", filters.minBeds.toString());
  if (filters.maxBeds !== undefined) params.set("maxBeds", filters.maxBeds.toString());

  // Bathrooms
  if (filters.minBaths !== undefined) params.set("minBaths", filters.minBaths.toString());
  if (filters.maxBaths !== undefined) params.set("maxBaths", filters.maxBaths.toString());

  // Property Type
  if (filters.propertyType?.length) {
    params.set("propertyType", filters.propertyType.join(","));
  }

  // Tenure
  if (filters.tenure?.length) {
    params.set("tenure", filters.tenure.join(","));
  }

  // Features
  if (filters.features) {
    Object.entries(filters.features).forEach(([key, value]) => {
      if (value) params.set(key, "true");
    });
  }

  // Sort
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  return params;
}

/**
 * Check if any filters are active
 */
function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.location !== undefined ||
    filters.radius !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minBeds !== undefined ||
    filters.maxBeds !== undefined ||
    filters.minBaths !== undefined ||
    filters.maxBaths !== undefined ||
    (filters.propertyType?.length ?? 0) > 0 ||
    (filters.tenure?.length ?? 0) > 0 ||
    Object.values(filters.features || {}).some(Boolean) ||
    (filters.sortBy !== undefined && filters.sortBy !== "newest")
  );
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
