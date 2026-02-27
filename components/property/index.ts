/**
 * Property Search Components
 * 
 * Professional-grade search functionality for property listings
 * featuring advanced filters, quick filters, and URL-based persistence.
 */

// Main Components
export { default as AdvancedSearch } from "./AdvancedSearch";
export { default as ActiveFilters } from "./ActiveFilters";
export { default as QuickFilters } from "./QuickFilters";
export { default as MobileFilterDrawer, MobileFilterButton } from "./MobileFilterDrawer";
export { default as PropertySearchBar } from "./PropertySearchBar";

// Types
export type { SearchFilters } from "./AdvancedSearch";
export type { MobileFilterDrawerProps, MobileFilterButtonProps } from "./MobileFilterDrawer";

// Constants
export { 
  RADIUS_OPTIONS,
  PRICE_OPTIONS,
  PROPERTY_TYPES,
  SORT_OPTIONS,
  FEATURE_OPTIONS,
} from "./AdvancedSearch";

export { QUICK_FILTERS } from "./QuickFilters";

// Utilities
export {
  formatPrice,
  formatRadius,
  formatPropertyType,
  formatTenure,
  formatFeature,
  formatSortBy,
} from "./ActiveFilters";

// Re-export hook for convenience
export { useSearchFilters } from "@/hooks/useSearchFilters";
