"use client";

import type { ReactNode } from "react";
import { canonicalFiltersToLegacyPatch, legacyFiltersToCanonical, type LegacySearchFilters } from "@/lib/property-search/ui-options";
import type { PropertyDepartment } from "@/lib/property-search/types";
import PropertySearchBarView, { type PropertySearchBarProps, type ViewMode } from "./PropertySearchBarView";

interface LegacyPropertySearchBarProps {
  department: PropertyDepartment;
  filters: LegacySearchFilters;
  onFilterChange: (filters: Partial<LegacySearchFilters>) => void;
  onClearFilters: () => void;
  onSearch?: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  resultCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
  showMapButton?: boolean;
}

export default function PropertySearchBar(props: PropertySearchBarProps): ReactNode;
/** @deprecated Task 8/9 compatibility only. */
export default function PropertySearchBar(props: LegacyPropertySearchBarProps): ReactNode;
export default function PropertySearchBar(props: PropertySearchBarProps | LegacyPropertySearchBarProps): ReactNode {
  if (isCanonicalPropertySearchBarProps(props)) return <PropertySearchBarView {...props} />;

  return (
    <PropertySearchBarView
      department={props.department}
      filters={legacyFiltersToCanonical(props.filters)}
      onFilterChange={(filters) => props.onFilterChange(canonicalFiltersToLegacyPatch(filters))}
      onClearFilters={props.onClearFilters}
      onSearch={props.onSearch ?? (() => undefined)}
      hasActiveFilters={props.hasActiveFilters}
      isLoading={props.isLoading}
      resultCount={props.resultCount}
      viewMode={props.viewMode}
      onViewModeChange={props.onViewModeChange}
      className={props.className}
      showMapButton={props.showMapButton}
    />
  );
}

function isCanonicalPropertySearchBarProps(
  props: PropertySearchBarProps | LegacyPropertySearchBarProps,
): props is PropertySearchBarProps {
  return (
    "propertyTypes" in props.filters &&
    Array.isArray(props.filters.propertyTypes) &&
    Array.isArray(props.filters.tenures) &&
    Array.isArray(props.filters.features) &&
    (props.filters.sort === "default" ||
      props.filters.sort === "price_asc" ||
      props.filters.sort === "price_desc")
  );
}

export type { PropertySearchBarProps, ViewMode } from "./PropertySearchBarView";
