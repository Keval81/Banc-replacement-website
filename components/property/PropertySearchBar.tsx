/* eslint-disable @typescript-eslint/ban-ts-comment -- inactive compatibility source retained until Task 8/9 cleanup. */
// @ts-nocheck -- inactive compatibility source retained until Task 8/9 cleanup.
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  X,
  Loader2,
} from "lucide-react";

// Import our new components
import {
  AdvancedSearch,
  ActiveFilters,
  QuickFilters,
  MobileFilterDrawer,
  MobileFilterButton,
  type SearchFilters,
} from "./";

// ============================================
// Types & Interfaces
// ============================================

type ViewMode = "grid" | "list" | "map";

interface PropertySearchBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  resultCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
  showMapButton?: boolean;
}

// ============================================
// Components
// ============================================

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const options: { value: ViewMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { value: "grid", icon: Grid3X3, label: "Grid" },
    { value: "list", icon: List, label: "List" },
    { value: "map", icon: Map, label: "Map" },
  ];

  return (
    <div className="flex items-center gap-1 bg-[#F4F3F1] rounded-xl p-1 border border-[#E0DFDC]">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white text-[#4AC8E8] shadow-sm"
                : "text-[#8A8880] hover:text-[#1A1917]"
            )}
            aria-pressed={isActive}
            title={option.label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function PropertySearchBar({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  isLoading,
  resultCount,
  viewMode = "grid",
  onViewModeChange,
  className,
  showMapButton = true,
}: PropertySearchBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [showAdvancedDesktop, setShowAdvancedDesktop] = React.useState(false);
  const [locationInput, setLocationInput] = React.useState(filters.location || "");

  // Sync location input with filters
  React.useEffect(() => {
    setLocationInput(filters.location || "");
  }, [filters.location]);

  // Count active filters for mobile badge
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.radius) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.minBeds !== undefined) count++;
    if (filters.maxBeds !== undefined) count++;
    if (filters.minBaths !== undefined) count++;
    if (filters.propertyType?.length) count += filters.propertyType.length;
    if (filters.tenure?.length) count += filters.tenure.length;
    if (filters.features) {
      count += Object.values(filters.features).filter(Boolean).length;
    }
    if (filters.sortBy && filters.sortBy !== "newest") count++;
    return count;
  }, [filters]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ location: locationInput || undefined });
  };

  return (
    <>
      <div className={cn("w-full", className)}>
        {/* Main Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E0DFDC] shadow-sm overflow-hidden">
          {/* Primary Search Row */}
          <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Location Search */}
              <form onSubmit={handleLocationSubmit} className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8880]" />
                  <Input
                    type="text"
                    placeholder="Search by area, town or postcode..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className={cn(
                      "pl-12 pr-12 h-12 text-base bg-[#F4F3F1] border-[#E0DFDC]",
                      "focus:bg-white focus:border-[#4AC8E8] focus:ring-[#4AC8E8]",
                      "placeholder:text-[#9CA3AF]"
                    )}
                  />
                  {locationInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationInput("");
                        onFilterChange({ location: undefined });
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[#E0DFDC] rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-[#8A8880]" />
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <MobileFilterButton
                  onClick={() => setMobileFiltersOpen(true)}
                  activeFilterCount={activeFilterCount}
                  className="lg:hidden"
                />

                {/* Desktop Advanced Filters Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedDesktop(!showAdvancedDesktop)}
                  className={cn(
                    "hidden lg:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
                    "text-sm font-medium transition-all duration-200",
                    "border focus:outline-none focus:ring-2 focus:ring-[#4AC8E8] focus:ring-offset-2",
                    showAdvancedDesktop || hasActiveFilters
                      ? "bg-[#4AC8E8]/10 text-[#4AC8E8] border-[#4AC8E8]/30"
                      : "bg-white text-[#8A8880] border-[#E0DFDC] hover:border-[#4AC8E8] hover:text-[#4AC8E8]"
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#4AC8E8] text-white text-xs font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Search Button */}
                <Button
                  onClick={handleLocationSubmit}
                  disabled={isLoading}
                  className={cn(
                    "h-12 px-6 bg-[#4AC8E8] hover:bg-[#1A9BBF] text-white font-semibold",
                    "transition-all duration-200",
                    "disabled:opacity-70"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Filters Row */}
          <div className="px-4 lg:px-6 pb-4 lg:pb-6 border-t border-[#E0DFDC] pt-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <QuickFilters
                filters={filters}
                onFilterChange={onFilterChange}
              />
              
              {/* View Mode Toggle (Desktop) */}
              {onViewModeChange && (
                <div className="hidden lg:block ml-auto">
                  <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <AnimatePresence>
          {(hasActiveFilters || resultCount !== undefined) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <ActiveFilters
                filters={filters}
                onFilterChange={onFilterChange}
                onClearAll={onClearFilters}
                resultCount={resultCount}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvancedDesktop && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-white rounded-2xl border border-[#E0DFDC] shadow-sm max-h-[600px] overflow-y-auto">
                <AdvancedSearch
                  filters={filters}
                  onFilterChange={onFilterChange}
                  onClearFilters={onClearFilters}
                  hasActiveFilters={hasActiveFilters}
                  isLoading={isLoading}
                  resultCount={resultCount}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        resultCount={resultCount}
      />
    </>
  );
}

// Export types
export type { ViewMode, PropertySearchBarProps };
