/**
 * Property Search Components
 * 
 * Professional-grade search functionality for property listings
 * featuring advanced filters, quick filters, and URL-based persistence.
 */

// Main Components
export { default as AdvancedSearch } from "./AdvancedSearchView";
export { default as ActiveFilters } from "./ActiveFiltersView";
export { default as QuickFilters } from "./QuickFiltersView";
export { default as MobileFilterDrawer, MobileFilterButton } from "./MobileFilterDrawer";
export {
  default as PropertySearchBar,
  default as PropertySearchBarView,
} from "./PropertySearchBarView";

// Types
export type { MobileFilterDrawerProps, MobileFilterButtonProps } from "./MobileFilterDrawer";
export type { PropertySearchBarProps, ViewMode } from "./PropertySearchBarView";
export type {
  PropertyDepartment,
  PropertySearchFilters,
  PropertySearchQuery,
  PropertySort,
  PublicPropertyStatus,
} from "@/lib/property-search/types";

// Constants
export {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  FEATURE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SORT_OPTIONS,
  TENURE_OPTIONS,
  getPriceOptions,
} from "@/lib/property-search/ui-options";

export { QUICK_FILTERS } from "./QuickFiltersView";

// Re-export hook for convenience
export { useSearchFilters } from "@/hooks/useSearchFilters";
