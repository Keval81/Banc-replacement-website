"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Search,
  MapPin,
  Home,
  Building2,
  Warehouse,
  TreePine,
  Castle,
  LandPlot,
  Store,
  X,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Navigation,
} from "lucide-react";

// ============================================
// Types & Interfaces
// ============================================

export interface SearchFilters {
  // Location
  location?: string;
  radius?: number;
  
  // Price
  minPrice?: number;
  maxPrice?: number;
  
  // Bedrooms & Bathrooms
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  
  // Property Type
  propertyType?: string[];
  
  // Tenure
  tenure?: string[];
  
  // Features
  features?: {
    garden?: boolean;
    parking?: boolean;
    garage?: boolean;
    conservatory?: boolean;
    fireplace?: boolean;
    periodFeatures?: boolean;
    newBuild?: boolean;
    chainFree?: boolean;
    virtualTour?: boolean;
    videoTour?: boolean;
  };
  
  // Sort
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'reduced' | 'popular';
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  resultCount?: number;
}

// ============================================
// Constants & Options
// ============================================

const RADIUS_OPTIONS = [
  { value: 0.25, label: "¼ mile" },
  { value: 0.5, label: "½ mile" },
  { value: 1, label: "1 mile" },
  { value: 3, label: "3 miles" },
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 15, label: "15 miles" },
  { value: 20, label: "20 miles" },
];

const PRICE_OPTIONS = [
  { value: 0, label: "No min" },
  { value: 100000, label: "£100k" },
  { value: 200000, label: "£200k" },
  { value: 300000, label: "£300k" },
  { value: 400000, label: "£400k" },
  { value: 500000, label: "£500k" },
  { value: 600000, label: "£600k" },
  { value: 700000, label: "£700k" },
  { value: 800000, label: "£800k" },
  { value: 900000, label: "£900k" },
  { value: 1000000, label: "£1m" },
  { value: 1250000, label: "£1.25m" },
  { value: 1500000, label: "£1.5m" },
  { value: 2000000, label: "£2m" },
  { value: 3000000, label: "£3m" },
  { value: 5000000, label: "£5m" },
  { value: 10000000, label: "£10m" },
];

const BEDROOM_OPTIONS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
  { value: 6, label: "6+" },
];

const BATHROOM_OPTIONS = [
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

const PROPERTY_TYPES = [
  { id: "house", label: "House", icon: Home },
  { id: "flat", label: "Flat", icon: Building2 },
  { id: "bungalow", label: "Bungalow", icon: Warehouse },
  { id: "maisonette", label: "Maisonette", icon: Building2 },
  { id: "land", label: "Land", icon: LandPlot },
  { id: "commercial", label: "Commercial", icon: Store },
];

const TENURE_OPTIONS = [
  { id: "freehold", label: "Freehold" },
  { id: "leasehold", label: "Leasehold" },
  { id: "share_of_freehold", label: "Share of Freehold" },
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Listed" },
  { value: "reduced", label: "Reduced Price" },
  { value: "popular", label: "Most Popular" },
];

const FEATURE_OPTIONS = [
  { key: "garden", label: "Garden / Outside space" },
  { key: "parking", label: "Parking" },
  { key: "garage", label: "Garage" },
  { key: "conservatory", label: "Conservatory" },
  { key: "fireplace", label: "Fireplace" },
  { key: "periodFeatures", label: "Period features" },
  { key: "newBuild", label: "New build" },
  { key: "chainFree", label: "Chain free" },
  { key: "virtualTour", label: "Virtual tour available" },
  { key: "videoTour", label: "Video tour available" },
] as const;

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

// ============================================
// Components
// ============================================

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <h3 className="text-sm font-semibold text-[#2C2F33] mb-3 flex items-center gap-2 font-heading">
      {Icon && <Icon className="w-4 h-4 text-[#1DBFDD]" />}
      {children}
    </h3>
  );
}

function FilterChip({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 font-medium",
        isActive
          ? "bg-[#1DBFDD] text-white border-[#1DBFDD] shadow-sm"
          : "bg-white text-[#6B6E72] border-[#C8C9CB] hover:border-[#1DBFDD] hover:text-[#1DBFDD]"
      )}
    >
      {label}
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export default function AdvancedSearch({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  isMobile,
  onClose,
  isLoading,
  resultCount,
}: AdvancedSearchProps) {
  const [expandedSections, setExpandedSections] = React.useState<string[]>(["location", "price"]);
  const [locationSuggestions, setLocationSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Popular locations for autocomplete
  const popularLocations = [
    "Cuffley",
    "Mayfair",
    "Hadley Wood",
    "Brookmans Park",
    "Potters Bar",
    "W1K",
    "EN4",
    "EN6",
    "AL9",
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleLocationChange = (value: string) => {
    onFilterChange({ location: value || undefined });
    
    // Simple autocomplete
    if (value.length > 1) {
      const matches = popularLocations.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = (location: string) => {
    onFilterChange({ location });
    setShowSuggestions(false);
  };

  const handlePropertyTypeToggle = (typeId: string) => {
    const current = filters.propertyType || [];
    const updated = current.includes(typeId)
      ? current.filter((t) => t !== typeId)
      : [...current, typeId];
    onFilterChange({ propertyType: updated.length > 0 ? updated : undefined });
  };

  const handleTenureToggle = (tenureId: string) => {
    const current = filters.tenure || [];
    const updated = current.includes(tenureId)
      ? current.filter((t) => t !== tenureId)
      : [...current, tenureId];
    onFilterChange({ tenure: updated.length > 0 ? updated : undefined });
  };

  const handleFeatureToggle = (featureKey: keyof SearchFilters["features"]) => {
    const currentFeatures = filters.features || {};
    onFilterChange({
      features: {
        ...currentFeatures,
        [featureKey]: !currentFeatures[featureKey],
      },
    });
  };

  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border-b border-[#E5E7EB] last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-left group"
          aria-expanded={isExpanded}
        >
          <SectionTitle icon={Icon}>{title}</SectionTitle>
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-[#6B6E72] transition-transform duration-200",
              isExpanded && "rotate-180"
            )} 
          />
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={cn("bg-white h-full flex flex-col", isMobile ? "max-h-[100dvh] landscape:max-h-[100dvh]" : "rounded-2xl border border-[#E5E7EB] shadow-sm")}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0",
        isMobile && "sticky top-0 bg-white z-10"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1DBFDD]/10">
            <SlidersHorizontal className="w-5 h-5 text-[#1DBFDD]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#2C2F33] font-heading">Filters</h2>
            {resultCount !== undefined && (
              <p className="text-sm text-[#6B6E72]">
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${resultCount} propert${resultCount === 1 ? "y" : "ies"} found`
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm font-medium text-[#1DBFDD] hover:text-[#0E8CAB] transition-colors"
            >
              Clear all
            </button>
          )}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F0F0ED] rounded-full transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-[#6B6E72]" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 landscape:max-h-[calc(100dvh-180px)]">
        {/* Sort Options - Always visible at top */}
        <div className="py-4 border-b border-[#E5E7EB]">
          <SectionTitle>Sort by</SectionTitle>
          <div className="relative">
            <select
              value={filters.sortBy || "newest"}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SearchFilters["sortBy"] })}
              className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] focus:border-transparent cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6E72] pointer-events-none" />
          </div>
        </div>

        {/* Location Section */}
        <Section id="location" title="Location" icon={MapPin}>
          <div className="space-y-3">
            {/* Location Input with Autocomplete */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6E72]" />
                <Input
                  type="text"
                  placeholder="Enter area or postcode"
                  value={filters.location || ""}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-10 pr-10 bg-[#F9FAFB] border-[#E5E7EB] focus:bg-white"
                />
                {filters.location && (
                  <button
                    onClick={() => onFilterChange({ location: undefined })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#E5E7EB] rounded-full"
                  >
                    <X className="w-3 h-3 text-[#6B6E72]" />
                  </button>
                )}
              </div>
              
              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden"
                  >
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleLocationSelect(suggestion)}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#2C2F33] hover:bg-[#F9FAFB] flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-[#1DBFDD]" />
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Radius Selector */}
            <div>
              <Label className="text-xs text-[#6B6E72] mb-2 block">Search radius</Label>
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    isActive={filters.radius === option.value}
                    onClick={() => onFilterChange({ 
                      radius: filters.radius === option.value ? undefined : option.value 
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Price Section */}
        <Section id="price" title="Price Range" icon={Navigation}>
          <div className="space-y-4">
            {/* Price Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#6B6E72] mb-1.5 block">Min Price</Label>
                <div className="relative">
                  <select
                    value={filters.minPrice || ""}
                    onChange={(e) => onFilterChange({ 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] cursor-pointer"
                  >
                    <option value="">No min</option>
                    {PRICE_OPTIONS.filter(o => o.value > 0).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6E72] pointer-events-none" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-[#6B6E72] mb-1.5 block">Max Price</Label>
                <div className="relative">
                  <select
                    value={filters.maxPrice || ""}
                    onChange={(e) => onFilterChange({ 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#2C2F33] focus:outline-none focus:ring-2 focus:ring-[#1DBFDD] cursor-pointer"
                  >
                    <option value="">No max</option>
                    {PRICE_OPTIONS.filter(o => o.value > 0).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6E72] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Price Range Display */}
            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6E72]">
                  {filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "Any price"}
                </span>
                <span className="text-[#C8C9CB]">—</span>
                <span className="text-[#6B6E72]">
                  {filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "No max"}
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* Bedrooms Section */}
        <Section id="bedrooms" title="Bedrooms" icon={Home}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#6B6E72] mb-2 block">Minimum bedrooms</Label>
              <div className="flex flex-wrap gap-2">
                {BEDROOM_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    isActive={filters.minBeds === option.value}
                    onClick={() => onFilterChange({ 
                      minBeds: filters.minBeds === option.value ? undefined : option.value 
                    })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-[#6B6E72] mb-2 block">Maximum bedrooms</Label>
              <div className="flex flex-wrap gap-2">
                {BEDROOM_OPTIONS.filter(o => o.value >= (filters.minBeds || 0)).map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    isActive={filters.maxBeds === option.value}
                    onClick={() => onFilterChange({ 
                      maxBeds: filters.maxBeds === option.value ? undefined : option.value 
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Bathrooms Section */}
        <Section id="bathrooms" title="Bathrooms" icon={Building2}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#6B6E72] mb-2 block">Minimum bathrooms</Label>
              <div className="flex flex-wrap gap-2">
                {BATHROOM_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    isActive={filters.minBaths === option.value}
                    onClick={() => onFilterChange({ 
                      minBaths: filters.minBaths === option.value ? undefined : option.value 
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Property Type Section */}
        <Section id="propertyType" title="Property Type" icon={Home}>
          <div className="space-y-2">
            {PROPERTY_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = filters.propertyType?.includes(type.id);
              return (
                <label
                  key={type.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                    isSelected 
                      ? "bg-[#1DBFDD]/5 border-[#1DBFDD]/30" 
                      : "bg-white border-transparent hover:bg-[#F9FAFB]"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handlePropertyTypeToggle(type.id)}
                    className="data-[state=checked]:bg-[#1DBFDD] data-[state=checked]:border-[#1DBFDD]"
                  />
                  <Icon className={cn("w-4 h-4", isSelected ? "text-[#1DBFDD]" : "text-[#6B6E72]")} />
                  <span className={cn("text-sm", isSelected ? "text-[#2C2F33] font-medium" : "text-[#6B6E72]")}>
                    {type.label}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>

        {/* Tenure Section */}
        <Section id="tenure" title="Tenure" icon={Castle}>
          <div className="space-y-2">
            {TENURE_OPTIONS.map((option) => {
              const isSelected = filters.tenure?.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                    isSelected 
                      ? "bg-[#1DBFDD]/5 border-[#1DBFDD]/30" 
                      : "bg-white border-transparent hover:bg-[#F9FAFB]"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleTenureToggle(option.id)}
                    className="data-[state=checked]:bg-[#1DBFDD] data-[state=checked]:border-[#1DBFDD]"
                  />
                  <span className={cn("text-sm", isSelected ? "text-[#2C2F33] font-medium" : "text-[#6B6E72]")}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>

        {/* Features Section */}
        <Section id="features" title="Features & Amenities" icon={TreePine}>
          <div className="space-y-2">
            {FEATURE_OPTIONS.map((option) => {
              const isSelected = filters.features?.[option.key];
              return (
                <label
                  key={option.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                    isSelected 
                      ? "bg-[#1DBFDD]/5 border-[#1DBFDD]/30" 
                      : "bg-white border-transparent hover:bg-[#F9FAFB]"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleFeatureToggle(option.key as keyof SearchFilters["features"])}
                    className="data-[state=checked]:bg-[#1DBFDD] data-[state=checked]:border-[#1DBFDD]"
                  />
                  <span className={cn("text-sm", isSelected ? "text-[#2C2F33] font-medium" : "text-[#6B6E72]")}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Mobile Footer Actions */}
      {isMobile && (
        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-3">
          <Button
            onClick={onClose}
            className="w-full bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Show ${resultCount !== undefined ? resultCount : ""} Results`
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full h-12 text-base border-[#E5E7EB]"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Export constants for use in other components
export { RADIUS_OPTIONS, PRICE_OPTIONS, PROPERTY_TYPES, SORT_OPTIONS, FEATURE_OPTIONS };
