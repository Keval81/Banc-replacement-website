"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Grid3X3, List, Loader2, Map, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PropertyDepartment, PropertySearchFilters } from "@/lib/property-search/types";
import { cn } from "@/lib/utils";
import ActiveFilters from "./ActiveFiltersView";
import AdvancedSearch from "./AdvancedSearchView";
import MobileFilterDrawer, { MobileFilterButton } from "./MobileFilterDrawer";
import QuickFilters from "./QuickFiltersView";

export type ViewMode = "grid" | "list" | "map";

export interface PropertySearchBarProps {
  department: PropertyDepartment;
  filters: PropertySearchFilters;
  onFilterChange: (filters: Partial<PropertySearchFilters>) => void;
  onClearFilters: () => void;
  onSearch: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  resultCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
  showMapButton?: boolean;
}

function countFilters(filters: PropertySearchFilters): number {
  return Number(Boolean(filters.location)) +
    Number(filters.minPrice !== undefined) + Number(filters.maxPrice !== undefined) +
    Number(filters.minBedrooms !== undefined) + Number(filters.minBathrooms !== undefined) +
    filters.propertyTypes.length + filters.tenures.length + filters.features.length +
    Number(filters.sort !== "default");
}

function ViewModeToggle({ mode, onChange, showMapButton }: { mode: ViewMode; onChange: (mode: ViewMode) => void; showMapButton: boolean }) {
  const options: Array<{ value: ViewMode; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { value: "grid", icon: Grid3X3, label: "Grid" },
    { value: "list", icon: List, label: "List" },
  ];
  if (showMapButton) options.push({ value: "map", icon: Map, label: "Map" });
  return <div className="flex items-center gap-1 rounded-xl border border-[#E0DFDC] bg-[#F4F3F1] p-1" role="group" aria-label="Results view">{options.map((option) => { const Icon = option.icon; return <button key={option.value} type="button" onClick={() => onChange(option.value)} aria-label={`${option.label} view`} aria-pressed={mode === option.value} className={cn("flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8]", mode === option.value ? "bg-white text-[#4AC8E8] shadow-sm" : "text-[#8A8880] hover:text-[#1A1917]")}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{option.label}</span></button>; })}</div>;
}

export default function PropertySearchBar({ department, filters, onFilterChange, onClearFilters, onSearch, hasActiveFilters, isLoading = false, resultCount, viewMode = "grid", onViewModeChange, className, showMapButton = true }: PropertySearchBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [showAdvancedDesktop, setShowAdvancedDesktop] = React.useState(false);
  const [locationInput, setLocationInput] = React.useState(filters.location ?? "");
  React.useEffect(() => setLocationInput(filters.location ?? ""), [filters.location]);

  const commitLocationAndSearch = React.useCallback(() => {
    if (isLoading) return;
    const location = locationInput.trim() || undefined;
    flushSync(() => onFilterChange({ location }));
    onSearch();
  }, [isLoading, locationInput, onFilterChange, onSearch]);

  return (
    <>
      <div className={cn("min-w-0 overflow-hidden", className)}>
        <div className="overflow-hidden rounded-2xl border border-[#E0DFDC] bg-white shadow-sm">
          <form onSubmit={(event) => { event.preventDefault(); commitLocationAndSearch(); }} className="p-4 lg:p-6">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="property-location" className="sr-only">Area, town or postcode</label>
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8880]" />
                <Input id="property-location" type="text" placeholder="Search by area, town or postcode…" value={locationInput} onChange={(event) => setLocationInput(event.target.value)} className="h-12 bg-[#F4F3F1] pl-12 pr-12 text-base placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#4AC8E8] focus:ring-[#4AC8E8]" />
                {locationInput && <button type="button" onClick={() => { setLocationInput(""); onFilterChange({ location: undefined }); }} aria-label="Clear location" className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#E0DFDC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8]"><X className="h-4 w-4 text-[#8A8880]" /></button>}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <MobileFilterButton onClick={() => setMobileFiltersOpen(true)} activeFilterCount={countFilters(filters)} className="lg:hidden" />
                <button type="button" onClick={() => setShowAdvancedDesktop((open) => !open)} aria-expanded={showAdvancedDesktop} className={cn("hidden min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AC8E8] focus-visible:ring-offset-2 lg:inline-flex", showAdvancedDesktop || hasActiveFilters ? "border-[#4AC8E8]/30 bg-[#4AC8E8]/10 text-[#4AC8E8]" : "border-[#E0DFDC] bg-white text-[#8A8880] hover:border-[#4AC8E8] hover:text-[#4AC8E8]")}><SlidersHorizontal className="h-4 w-4" />Filters{countFilters(filters) > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4AC8E8] px-1.5 text-xs font-semibold text-white">{countFilters(filters)}</span>}</button>
                <Button type="submit" disabled={isLoading} aria-busy={isLoading} className="h-12 min-w-28 bg-[#4AC8E8] px-5 font-semibold text-white transition-colors duration-200 hover:bg-[#1A9BBF] disabled:cursor-not-allowed disabled:opacity-70">{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching…</> : <><Search className="mr-2 h-4 w-4" />Search</>}</Button>
              </div>
            </div>
          </form>
          <div className="min-w-0 border-t border-[#E0DFDC] px-4 pb-4 pt-4 lg:px-6 lg:pb-6"><div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center"><QuickFilters filters={filters} onFilterChange={onFilterChange} />{onViewModeChange && <div className="hidden shrink-0 lg:block"><ViewModeToggle mode={viewMode} onChange={onViewModeChange} showMapButton={showMapButton} /></div>}</div></div>
        </div>

        <AnimatePresence>{(hasActiveFilters || resultCount !== undefined) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4"><ActiveFilters department={department} filters={filters} onFilterChange={onFilterChange} onClearAll={onClearFilters} resultCount={resultCount} isLoading={isLoading} /></motion.div>}</AnimatePresence>
        <AnimatePresence>{showAdvancedDesktop && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4 hidden max-h-[600px] overflow-y-auto rounded-2xl lg:block"><AdvancedSearch department={department} filters={filters} onFilterChange={onFilterChange} onClearFilters={onClearFilters} hasActiveFilters={hasActiveFilters} isLoading={isLoading} resultCount={resultCount} /></motion.div>}</AnimatePresence>
      </div>
      <MobileFilterDrawer isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} department={department} filters={filters} onFilterChange={onFilterChange} onClearFilters={onClearFilters} hasActiveFilters={hasActiveFilters} isLoading={isLoading} resultCount={resultCount} />
    </>
  );
}
