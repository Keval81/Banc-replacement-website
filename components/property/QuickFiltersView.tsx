"use client";

import type * as React from "react";
import { Car, Eye, Home, Link2, TreePine, Video } from "lucide-react";
import { SEARCH_FEATURES, SEARCH_PROPERTY_TYPES, type SearchFeature, type SearchPropertyType } from "@/lib/crm/property-source";
import { toggleCanonicalOption } from "@/lib/property-search/ui-options";
import type { PropertySearchFilters } from "@/lib/property-search/types";
import { cn } from "@/lib/utils";

interface QuickFilter {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  kind: "feature" | "propertyType";
  value: SearchFeature | SearchPropertyType;
}

export interface QuickFiltersProps {
  filters: PropertySearchFilters;
  onFilterChange: (filters: Partial<PropertySearchFilters>) => void;
  className?: string;
}

export const QUICK_FILTERS: readonly QuickFilter[] = [
  { id: "houses-only", label: "Houses", description: "Show houses", icon: Home, kind: "propertyType", value: "house" },
  { id: "with-garden", label: "Garden", description: "Properties with a garden or outside space", icon: TreePine, kind: "feature", value: "garden" },
  { id: "parking-included", label: "Parking", description: "Properties with parking", icon: Car, kind: "feature", value: "parking" },
  { id: "chain-free", label: "Chain free", description: "Properties with no onward chain", icon: Link2, kind: "feature", value: "chain_free" },
  { id: "virtual-tour", label: "Virtual tour", description: "Properties with a virtual tour", icon: Eye, kind: "feature", value: "virtual_tour" },
  { id: "video-tour", label: "Video tour", description: "Properties with a video tour", icon: Video, kind: "feature", value: "video_tour" },
] as const;

export default function QuickFilters({ filters, onFilterChange, className }: QuickFiltersProps) {
  return (
    <div className={cn("min-w-0 overflow-hidden", className)}>
      <div className="flex max-w-full snap-x items-center gap-3 overflow-x-auto pb-2">
        {QUICK_FILTERS.map((filter) => {
          const isPropertyType = filter.kind === "propertyType";
          const selected = isPropertyType ? filters.propertyTypes : filters.features;
          const active = selected.includes(filter.value as never);
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              type="button"
              title={filter.description}
              aria-pressed={active}
              onClick={() => {
                if (isPropertyType) {
                  onFilterChange({ propertyTypes: toggleCanonicalOption(filters.propertyTypes, filter.value as SearchPropertyType, SEARCH_PROPERTY_TYPES) });
                } else {
                  onFilterChange({ features: toggleCanonicalOption(filters.features, filter.value as SearchFeature, SEARCH_FEATURES) });
                }
              }}
              className={cn(
                "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-xl border px-4 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8] focus-visible:ring-offset-2",
                active ? "border-[#4AC8E8] bg-[#4AC8E8] text-white shadow-md shadow-[#4AC8E8]/20" : "border-[#E0DFDC] bg-white text-[#5F5D57] hover:border-[#4AC8E8] hover:text-[#4AC8E8]",
              )}
            >
              <Icon className="h-4 w-4" />{filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
