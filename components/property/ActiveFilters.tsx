"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { SearchFilters } from "./AdvancedSearch";

// ============================================
// Types & Interfaces
// ============================================

interface ActiveFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearAll: () => void;
  resultCount?: number;
  isLoading?: boolean;
  className?: string;
}

interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
  type: string;
}

// ============================================
// Utility Functions
// ============================================

function formatPrice(value: number): string {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 2)}m`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}k`;
  }
  return `£${value}`;
}

function formatRadius(value: number): string {
  if (value === 0.25) return "¼ mile";
  if (value === 0.5) return "½ mile";
  return `${value} miles`;
}

function formatPropertyType(type: string): string {
  const formats: Record<string, string> = {
    house: "House",
    flat: "Flat",
    bungalow: "Bungalow",
    maisonette: "Maisonette",
    land: "Land",
    commercial: "Commercial",
  };
  return formats[type] || type;
}

function formatTenure(tenure: string): string {
  const formats: Record<string, string> = {
    freehold: "Freehold",
    leasehold: "Leasehold",
    share_of_freehold: "Share of Freehold",
  };
  return formats[tenure] || tenure;
}

function formatFeature(key: string): string {
  const formats: Record<string, string> = {
    garden: "Garden",
    parking: "Parking",
    garage: "Garage",
    conservatory: "Conservatory",
    fireplace: "Fireplace",
    periodFeatures: "Period features",
    newBuild: "New build",
    chainFree: "Chain free",
    virtualTour: "Virtual tour",
    videoTour: "Video tour",
  };
  return formats[key] || key;
}

function formatSortBy(sortBy: string): string {
  const formats: Record<string, string> = {
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    newest: "Newest Listed",
    reduced: "Reduced Price",
    popular: "Most Popular",
  };
  return formats[sortBy] || sortBy;
}

// ============================================
// Components
// ============================================

function FilterChip({ 
  label, 
  onRemove,
  delay = 0,
}: { 
  label: string; 
  onRemove: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.2, delay }}
      onClick={onRemove}
      className={cn(
        "group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-[#1DBFDD]/10 text-[#1DBFDD] text-sm font-medium",
        "border border-[#1DBFDD]/20",
        "hover:bg-[#1DBFDD]/20 hover:border-[#1DBFDD]/30",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:ring-offset-1"
      )}
    >
      <span>{label}</span>
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1DBFDD]/20 group-hover:bg-[#1DBFDD]/30 transition-colors">
        <X className="w-3 h-3" />
      </span>
    </motion.button>
  );
}

// ============================================
// Main Component
// ============================================

export default function ActiveFilters({
  filters,
  onFilterChange,
  onClearAll,
  resultCount,
  isLoading,
  className,
}: ActiveFiltersProps) {
  // Generate list of active filter chips
  const activeChips: FilterChip[] = React.useMemo(() => {
    const chips: FilterChip[] = [];

    // Location
    if (filters.location) {
      chips.push({
        id: "location",
        label: filters.location,
        onRemove: () => onFilterChange({ location: undefined }),
        type: "location",
      });
    }

    // Radius
    if (filters.radius) {
      chips.push({
        id: "radius",
        label: `Within ${formatRadius(filters.radius)}`,
        onRemove: () => onFilterChange({ radius: undefined }),
        type: "radius",
      });
    }

    // Price Range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minLabel = filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "Any";
      const maxLabel = filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "Any";
      chips.push({
        id: "price",
        label: `${minLabel} - ${maxLabel}`,
        onRemove: () => onFilterChange({ minPrice: undefined, maxPrice: undefined }),
        type: "price",
      });
    }

    // Bedrooms
    if (filters.minBeds !== undefined) {
      const label = filters.minBeds === 0 ? "Studio+" : `${filters.minBeds}+ beds`;
      chips.push({
        id: "minBeds",
        label,
        onRemove: () => onFilterChange({ minBeds: undefined }),
        type: "beds",
      });
    }

    if (filters.maxBeds !== undefined) {
      chips.push({
        id: "maxBeds",
        label: `Up to ${filters.maxBeds} beds`,
        onRemove: () => onFilterChange({ maxBeds: undefined }),
        type: "beds",
      });
    }

    // Bathrooms
    if (filters.minBaths !== undefined) {
      chips.push({
        id: "minBaths",
        label: `${filters.minBaths}+ baths`,
        onRemove: () => onFilterChange({ minBaths: undefined }),
        type: "baths",
      });
    }

    // Property Type
    filters.propertyType?.forEach((type) => {
      chips.push({
        id: `type-${type}`,
        label: formatPropertyType(type),
        onRemove: () => {
          const updated = filters.propertyType?.filter((t) => t !== type);
          onFilterChange({ propertyType: updated?.length ? updated : undefined });
        },
        type: "propertyType",
      });
    });

    // Tenure
    filters.tenure?.forEach((t) => {
      chips.push({
        id: `tenure-${t}`,
        label: formatTenure(t),
        onRemove: () => {
          const updated = filters.tenure?.filter((tenure) => tenure !== t);
          onFilterChange({ tenure: updated?.length ? updated : undefined });
        },
        type: "tenure",
      });
    });

    // Features
    Object.entries(filters.features || {}).forEach(([key, value]) => {
      if (value) {
        chips.push({
          id: `feature-${key}`,
          label: formatFeature(key),
          onRemove: () => {
            const updatedFeatures = { ...filters.features };
            delete updatedFeatures[key as keyof typeof updatedFeatures];
            onFilterChange({ features: Object.keys(updatedFeatures).length ? updatedFeatures : undefined });
          },
          type: "feature",
        });
      }
    });

    // Sort (only show if not default)
    if (filters.sortBy && filters.sortBy !== "newest") {
      chips.push({
        id: "sortBy",
        label: `Sort: ${formatSortBy(filters.sortBy)}`,
        onRemove: () => onFilterChange({ sortBy: undefined }),
        type: "sort",
      });
    }

    return chips;
  }, [filters, onFilterChange]);

  const hasActiveFilters = activeChips.length > 0;

  if (!hasActiveFilters && resultCount === undefined) {
    return null;
  }

  return (
    <div className={cn("bg-white", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Results Count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1DBFDD]/10">
            <SlidersHorizontal className="w-4 h-4 text-[#1DBFDD]" />
          </div>
          <div>
            {isLoading ? (
              <span className="text-[#6B6E72]">Loading properties...</span>
            ) : (
              <>
                <span className="font-semibold text-[#2C2F33]">
                  {resultCount?.toLocaleString() || 0}
                </span>
                <span className="text-[#6B6E72]">
                  {" "}
                  propert{resultCount === 1 ? "y" : "ies"} found
                </span>
              </>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-[#6B6E72] hidden lg:block">Active filters:</span>
            
            <div className="flex items-center gap-2 flex-wrap">
              <AnimatePresence mode="popLayout">
                {activeChips.slice(0, 5).map((chip, index) => (
                  <FilterChip
                    key={chip.id}
                    label={chip.label}
                    onRemove={chip.onRemove}
                    delay={index * 0.05}
                  />
                ))}
              </AnimatePresence>
              
              {activeChips.length > 5 && (
                <span className="text-sm text-[#6B6E72] px-2">
                  +{activeChips.length - 5} more
                </span>
              )}
            </div>

            {/* Clear All Button */}
            <button
              onClick={onClearAll}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                "text-[#6B6E72] hover:text-[#1DBFDD]",
                "transition-colors duration-200",
                "focus:outline-none focus:underline"
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Export utility functions
// ============================================

export {
  formatPrice,
  formatRadius,
  formatPropertyType,
  formatTenure,
  formatFeature,
  formatSortBy,
};
