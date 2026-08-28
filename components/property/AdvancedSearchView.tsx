"use client";

import * as React from "react";
import { Building2, ChevronDown, Home, Loader2, MapPin, SlidersHorizontal, TreePine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEARCH_FEATURES, SEARCH_PROPERTY_TYPES, SEARCH_TENURES, type SearchFeature, type SearchPropertyType, type SearchTenure } from "@/lib/crm/property-source";
import { getMinimumOnlyBedroomPatch } from "@/lib/property-search/navigation";
import { BATHROOM_OPTIONS, BEDROOM_OPTIONS, FEATURE_OPTIONS, PROPERTY_TYPE_OPTIONS, SORT_OPTIONS, TENURE_OPTIONS, formatSearchPrice, getPriceOptions, toggleCanonicalOption } from "@/lib/property-search/ui-options";
import type { PropertyDepartment, PropertySearchFilters } from "@/lib/property-search/types";
import { searchThenClose } from "@/lib/property-search/search-ui-actions";
import { cn } from "@/lib/utils";

export interface AdvancedSearchProps {
  department: PropertyDepartment;
  filters: PropertySearchFilters;
  onFilterChange: (filters: Partial<PropertySearchFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  resultCount?: number;
  onSearch?: () => void;
}

function OptionList<TValue extends string>({ name, options, selected, canonicalOrder, onChange }: {
  name: string;
  options: readonly { value: TValue; label: string }[];
  selected: readonly TValue[];
  canonicalOrder: readonly TValue[];
  onChange: (selected: TValue[]) => void;
}) {
  return <div className="space-y-1">{options.map((option) => {
    const checked = selected.includes(option.value);
    const id = `${name}-${option.value}`;
    return (
      <label key={option.value} htmlFor={id} className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors duration-200", checked ? "border-[#0B6F89]/30 bg-[#4AC8E8]/5 text-[#1A1917]" : "border-transparent text-[#5F5D57] hover:bg-[#F4F3F1]")}>
        <Checkbox id={id} checked={checked} onCheckedChange={() => onChange(toggleCanonicalOption(selected, option.value, canonicalOrder))} className="border-[#0B6F89] focus-visible:ring-[#0B6F89] data-[state=checked]:border-[#0B6F89] data-[state=checked]:bg-[#0B6F89]" />
        <span className="text-sm font-medium">{option.label}</span>
      </label>
    );
  })}</div>;
}

function FilterSection({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#E0DFDC] py-5 last:border-b-0">
      <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-[#1A1917]"><Icon className="h-4 w-4 text-[#0B6F89]" />{title}</h3>
      {children}
    </section>
  );
}

function NumberChips({ label, options, value, onChange }: { label: string; options: readonly { value: number; label: string }[]; value?: number; onChange: (value: number | undefined) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs text-[#5F5D57]">{label}</legend>
      <div className="flex flex-wrap gap-2">{options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(value === option.value ? undefined : option.value)} className={cn("min-h-11 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6F89] focus-visible:ring-offset-2", value === option.value ? "border-[#0B6F89] bg-[#0B6F89] text-white" : "border-[#E0DFDC] bg-white text-[#5F5D57] hover:border-[#0B6F89] hover:text-[#0B6F89]")}>{option.label}</button>
      ))}</div>
    </fieldset>
  );
}

export default function AdvancedSearch({ department, filters, onFilterChange, onClearFilters, hasActiveFilters, isMobile = false, onClose, isLoading = false, resultCount, onSearch }: AdvancedSearchProps) {
  const priceOptions = getPriceOptions(department);
  return (
    <div className={cn("flex h-full min-w-0 flex-col bg-white", !isMobile && "rounded-2xl border border-[#E0DFDC] shadow-sm")}>
      <header className={cn("flex items-center justify-between gap-3 border-b border-[#E0DFDC] px-5 py-4", isMobile && "sticky top-0 z-10 bg-white")}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4AC8E8]/10"><SlidersHorizontal className="h-5 w-5 text-[#0B6F89]" /></span>
          <div className="min-w-0"><h2 className="font-heading text-lg font-semibold text-[#1A1917]">Filters</h2><p className="text-sm text-[#5F5D57]" aria-live="polite">{isLoading ? "Loading properties…" : resultCount !== undefined ? `${resultCount} propert${resultCount === 1 ? "y" : "ies"} found` : department === "sales" ? "Properties to buy" : "Properties to rent"}</p></div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {hasActiveFilters && <button type="button" onClick={onClearFilters} className="min-h-11 px-2 text-sm font-medium text-[#0B6F89] transition-colors duration-200 hover:text-[#075E75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6F89]">Clear all</button>}
          {isMobile && onClose && <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#F4F3F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6F89]" aria-label="Close filters"><X className="h-5 w-5 text-[#5F5D57]" /></button>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="border-b border-[#E0DFDC] py-5">
          <Label htmlFor="property-sort" className="mb-2 block text-sm font-semibold text-[#1A1917]">Sort by</Label>
          <div className="relative"><select id="property-sort" value={filters.sort} onChange={(event) => onFilterChange({ sort: event.target.value as PropertySearchFilters["sort"] })} className="min-h-11 w-full appearance-none rounded-xl border border-[#E0DFDC] bg-[#F4F3F1] px-4 pr-10 text-base text-[#1A1917] focus:outline-none focus:ring-2 focus:ring-[#0B6F89] sm:text-sm">{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F5D57]" /></div>
        </div>

        <FilterSection title="Location" icon={MapPin}>
          <Label htmlFor="advanced-location" className="sr-only">Area, town or postcode</Label>
          <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F5D57]" /><Input id="advanced-location" type="text" placeholder="Enter area, town or postcode" value={filters.location ?? ""} onChange={(event) => onFilterChange({ location: event.target.value || undefined })} className="h-12 bg-[#F4F3F1] pl-10 pr-12 text-base placeholder:text-[#5F5D57] focus:bg-white focus-visible:ring-[#0B6F89]" />{filters.location && <button type="button" onClick={() => onFilterChange({ location: undefined })} className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6F89]" aria-label="Clear location"><X className="h-4 w-4 text-[#5F5D57]" /></button>}</div>
        </FilterSection>

        <FilterSection title={department === "sales" ? "Price range" : "Monthly rent"} icon={Building2}>
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">{(["minPrice", "maxPrice"] as const).map((field) => <div key={field}><Label htmlFor={field} className="mb-1.5 block text-xs text-[#5F5D57]">{field === "minPrice" ? "Minimum" : "Maximum"}</Label><select id={field} value={filters[field] ?? ""} onChange={(event) => onFilterChange({ [field]: event.target.value ? Number(event.target.value) : undefined })} className="min-h-11 w-full rounded-xl border border-[#E0DFDC] bg-[#F4F3F1] px-3 text-base text-[#1A1917] focus:outline-none focus:ring-2 focus:ring-[#0B6F89] sm:text-sm"><option value="">No {field === "minPrice" ? "minimum" : "maximum"}</option>{priceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>)}</div>
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && <p className="mt-3 text-sm text-[#5F5D57]">{filters.minPrice !== undefined ? formatSearchPrice(filters.minPrice, department) : "Any price"} — {filters.maxPrice !== undefined ? formatSearchPrice(filters.maxPrice, department) : "No maximum"}</p>}
        </FilterSection>

        <FilterSection title="Bedrooms" icon={Home}><NumberChips label="Minimum bedrooms" options={BEDROOM_OPTIONS} value={filters.minBedrooms} onChange={(minBedrooms) => onFilterChange(getMinimumOnlyBedroomPatch(filters, minBedrooms))} /></FilterSection>
        <FilterSection title="Bathrooms" icon={Building2}><NumberChips label="Minimum bathrooms" options={BATHROOM_OPTIONS} value={filters.minBathrooms} onChange={(minBathrooms) => onFilterChange({ minBathrooms })} /></FilterSection>
        <FilterSection title="Property type" icon={Home}><OptionList<SearchPropertyType> name="property-type" options={PROPERTY_TYPE_OPTIONS} selected={filters.propertyTypes} canonicalOrder={SEARCH_PROPERTY_TYPES} onChange={(propertyTypes) => onFilterChange({ propertyTypes })} /></FilterSection>
        <FilterSection title="Tenure" icon={Building2}><OptionList<SearchTenure> name="tenure" options={TENURE_OPTIONS} selected={filters.tenures} canonicalOrder={SEARCH_TENURES} onChange={(tenures) => onFilterChange({ tenures })} /></FilterSection>
        <FilterSection title="Features & amenities" icon={TreePine}><OptionList<SearchFeature> name="feature" options={FEATURE_OPTIONS} selected={filters.features} canonicalOrder={SEARCH_FEATURES} onChange={(features) => onFilterChange({ features })} /></FilterSection>
      </div>

      {isMobile && <footer className="sticky bottom-0 space-y-2 border-t border-[#E0DFDC] bg-white p-4"><Button type="button" onClick={() => searchThenClose(onSearch, onClose)} disabled={isLoading} className="h-12 w-full bg-[#0B6F89] text-base font-semibold text-white hover:bg-[#075E75] focus-visible:ring-[#0B6F89]">{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</> : `Show ${resultCount !== undefined ? resultCount : ""} results`}</Button>{hasActiveFilters && <Button type="button" variant="outline" onClick={onClearFilters} className="h-12 w-full border-[#5F5D57] text-base text-[#1A1917] hover:border-[#0B6F89] focus-visible:ring-[#0B6F89]">Clear all filters</Button>}</footer>}
    </div>
  );
}
