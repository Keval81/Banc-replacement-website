"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  TreePine,
  Car,
  Link2,
  Sparkles,
  TrendingDown,
  BadgePercent,
  Calendar,
  Video,
  Eye,
} from "lucide-react";
import type { SearchFilters } from "./AdvancedSearch";

// ============================================
// Types & Interfaces
// ============================================

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  applyFilter: (filters: SearchFilters) => Partial<SearchFilters>;
  isActive: (filters: SearchFilters) => boolean;
}

interface QuickFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  className?: string;
}

// ============================================
// Quick Filter Definitions
// ============================================

const QUICK_FILTERS: QuickFilter[] = [
  {
    id: "houses-only",
    label: "Houses only",
    icon: Home,
    description: "Show only houses",
    applyFilter: () => ({ propertyType: ["house"] }),
    isActive: (filters) => 
      filters.propertyType?.length === 1 && filters.propertyType[0] === "house",
  },
  {
    id: "with-garden",
    label: "With garden",
    icon: TreePine,
    description: "Properties with garden or outside space",
    applyFilter: (current) => ({
      features: {
        ...current.features,
        garden: true,
      },
    }),
    isActive: (filters) => filters.features?.garden === true,
  },
  {
    id: "parking-included",
    label: "Parking included",
    icon: Car,
    description: "Properties with parking or garage",
    applyFilter: (current) => ({
      features: {
        ...current.features,
        parking: true,
      },
    }),
    isActive: (filters) => filters.features?.parking === true,
  },
  {
    id: "chain-free",
    label: "Chain free",
    icon: Link2,
    description: "No onward chain properties",
    applyFilter: (current) => ({
      features: {
        ...current.features,
        chainFree: true,
      },
    }),
    isActive: (filters) => filters.features?.chainFree === true,
  },
  {
    id: "new-to-market",
    label: "New to market",
    icon: Sparkles,
    description: "Recently listed properties",
    applyFilter: () => ({ sortBy: "newest" as const }),
    isActive: (filters) => filters.sortBy === "newest",
  },
  {
    id: "reduced",
    label: "Reduced",
    icon: TrendingDown,
    description: "Price reduced properties",
    applyFilter: () => ({ sortBy: "reduced" as const }),
    isActive: (filters) => filters.sortBy === "reduced",
  },
  {
    id: "new-build",
    label: "New build",
    icon: Calendar,
    description: "Newly constructed properties",
    applyFilter: (current) => ({
      features: {
        ...current.features,
        newBuild: true,
      },
    }),
    isActive: (filters) => filters.features?.newBuild === true,
  },
  {
    id: "virtual-tour",
    label: "Virtual tour",
    icon: Eye,
    description: "Properties with virtual tours",
    applyFilter: (current) => ({
      features: {
        ...current.features,
        virtualTour: true,
      },
    }),
    isActive: (filters) => filters.features?.virtualTour === true,
  },
  {
    id: "video-tour",
    label: "Video tour",
    icon: Video,
    description: "Properties with video tours",
    applyFilter: (current) => ({
      features: {
        ...current.features,
        videoTour: true,
      },
    }),
    isActive: (filters) => filters.features?.videoTour === true,
  },
  {
    id: "premium",
    label: "Premium",
    icon: BadgePercent,
    description: "Premium listings",
    applyFilter: () => ({ minPrice: 1000000 }),
    isActive: (filters) => (filters.minPrice || 0) >= 1000000,
  },
];

// ============================================
// Components
// ============================================

function QuickFilterButton({
  filter,
  isActive,
  onClick,
}: {
  filter: QuickFilter;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = filter.icon;
  
  return (
    <button
      onClick={onClick}
      title={filter.description}
      className={cn(
        "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl",
        "text-sm font-medium whitespace-nowrap",
        "border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:ring-offset-2",
        isActive
          ? "bg-[#1DBFDD] text-white border-[#1DBFDD] shadow-md shadow-[#1DBFDD]/20"
          : "bg-white text-[#6B6E72] border-[#E5E7EB] hover:border-[#1DBFDD] hover:text-[#1DBFDD]"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 transition-transform duration-200",
        isActive ? "scale-110" : "group-hover:scale-110"
      )} />
      <span>{filter.label}</span>
      
      {/* Active indicator dot */}
      {isActive && (
        <span
          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-[#1DBFDD]"
        />
      )}
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export default function QuickFilters({
  filters,
  onFilterChange,
  className,
}: QuickFiltersProps) {
  const handleFilterClick = (filter: QuickFilter) => {
    const isActive = filter.isActive(filters);
    
    if (isActive) {
      // Remove the filter
      if (filter.id === "houses-only") {
        onFilterChange({ propertyType: undefined });
      } else if (filter.id === "new-to-market" || filter.id === "reduced") {
        onFilterChange({ sortBy: undefined });
      } else if (filter.id === "premium") {
        onFilterChange({ minPrice: undefined });
      } else {
        // Remove feature
        const updatedFeatures = { ...filters.features };
        
        // Map filter IDs to feature keys and remove
        switch (filter.id) {
          case "with-garden":
            delete updatedFeatures?.garden;
            break;
          case "parking-included":
            delete updatedFeatures?.parking;
            break;
          case "chain-free":
            delete updatedFeatures?.chainFree;
            break;
          case "new-build":
            delete updatedFeatures?.newBuild;
            break;
          case "virtual-tour":
            delete updatedFeatures?.virtualTour;
            break;
          case "video-tour":
            delete updatedFeatures?.videoTour;
            break;
        }
        
        onFilterChange({ features: Object.keys(updatedFeatures || {}).length ? updatedFeatures : undefined });
      }
    } else {
      // Apply the filter
      onFilterChange(filter.applyFilter(filters));
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x">
        {QUICK_FILTERS.map((filter) => (
          <div key={filter.id} className="snap-start">
            <QuickFilterButton
              filter={filter}
              isActive={filter.isActive(filters)}
              onClick={() => handleFilterClick(filter)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Export constants for use in other components
export { QUICK_FILTERS };
