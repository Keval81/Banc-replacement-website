"use client";

import * as React from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { FEATURE_OPTIONS, PROPERTY_TYPE_OPTIONS, SORT_OPTIONS, TENURE_OPTIONS, formatSearchPrice } from "@/lib/property-search/ui-options";
import type { PropertyDepartment, PropertySearchFilters } from "@/lib/property-search/types";
import { cn } from "@/lib/utils";

export interface ActiveFiltersProps {
  department: PropertyDepartment;
  filters: PropertySearchFilters;
  onFilterChange: (filters: Partial<PropertySearchFilters>) => void;
  onClearAll: () => void;
  resultCount?: number;
  isLoading?: boolean;
  className?: string;
}

function optionLabel<T extends string>(options: readonly { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function ActiveFilters({ department, filters, onFilterChange, onClearAll, resultCount, isLoading = false, className }: ActiveFiltersProps) {
  const chips = React.useMemo(() => {
    const result: Array<{ id: string; label: string; remove: () => void }> = [];
    if (filters.location) result.push({ id: "location", label: filters.location, remove: () => onFilterChange({ location: undefined }) });
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minimum = filters.minPrice !== undefined ? formatSearchPrice(filters.minPrice, department) : "Any";
      const maximum = filters.maxPrice !== undefined ? formatSearchPrice(filters.maxPrice, department) : "Any";
      result.push({ id: "price", label: `${minimum} – ${maximum}`, remove: () => onFilterChange({ minPrice: undefined, maxPrice: undefined }) });
    }
    if (filters.minBedrooms !== undefined) result.push({ id: "bedrooms", label: filters.minBedrooms === 0 ? "Studio+" : `${filters.minBedrooms}+ beds`, remove: () => onFilterChange({ minBedrooms: undefined }) });
    if (filters.minBathrooms !== undefined) result.push({ id: "bathrooms", label: `${filters.minBathrooms}+ baths`, remove: () => onFilterChange({ minBathrooms: undefined }) });
    for (const value of filters.propertyTypes) result.push({ id: `type-${value}`, label: optionLabel(PROPERTY_TYPE_OPTIONS, value), remove: () => onFilterChange({ propertyTypes: filters.propertyTypes.filter((item) => item !== value) }) });
    for (const value of filters.tenures) result.push({ id: `tenure-${value}`, label: optionLabel(TENURE_OPTIONS, value), remove: () => onFilterChange({ tenures: filters.tenures.filter((item) => item !== value) }) });
    for (const value of filters.features) result.push({ id: `feature-${value}`, label: optionLabel(FEATURE_OPTIONS, value), remove: () => onFilterChange({ features: filters.features.filter((item) => item !== value) }) });
    if (filters.sort !== "default") result.push({ id: "sort", label: `Sort: ${optionLabel(SORT_OPTIONS, filters.sort)}`, remove: () => onFilterChange({ sort: "default" }) });
    return result;
  }, [department, filters, onFilterChange]);

  if (chips.length === 0 && resultCount === undefined) return null;

  return (
    <div className={cn("min-w-0 bg-white", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2" aria-live="polite">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4AC8E8]/10"><SlidersHorizontal className="h-4 w-4 text-[#4AC8E8]" /></span>
          {isLoading ? <span className="text-[#8A8880]">Loading properties…</span> : <span><strong className="text-[#1A1917]">{(resultCount ?? 0).toLocaleString()}</strong><span className="text-[#8A8880]"> propert{resultCount === 1 ? "y" : "ies"} found</span></span>}
        </div>
        {chips.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {chips.slice(0, 5).map((chip) => <button key={chip.id} type="button" onClick={chip.remove} aria-label={`Remove ${chip.label} filter`} className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-[#4AC8E8]/20 bg-[#4AC8E8]/10 px-3 text-sm font-medium text-[#4AC8E8] transition-colors duration-200 hover:bg-[#4AC8E8]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8] focus-visible:ring-offset-1"><span className="truncate">{chip.label}</span><X className="h-3.5 w-3.5 shrink-0" /></button>)}
            {chips.length > 5 && <span className="px-2 text-sm text-[#8A8880]">+{chips.length - 5} more</span>}
            <button type="button" onClick={onClearAll} className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-medium text-[#8A8880] transition-colors duration-200 hover:text-[#4AC8E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8]"><RotateCcw className="h-3.5 w-3.5" />Clear all</button>
          </div>
        )}
      </div>
    </div>
  );
}
