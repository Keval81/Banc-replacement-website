"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  X, 
  SlidersHorizontal,
  Search,
  Home,
  Building2,
  Castle,
  Warehouse,
  TreePine,
  Calendar
} from "lucide-react";

interface SearchFiltersProps {
  filters: {
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    propertyType?: string[];
    tenure?: string;
    keywords?: string;
    addedSince?: string;
    includeArchived?: boolean;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const propertyTypes = [
  { id: "house", label: "House", icon: Home },
  { id: "apartment", label: "Apartment", icon: Building2 },
  { id: "penthouse", label: "Penthouse", icon: Building2 },
  { id: "mansion", label: "Mansion", icon: Castle },
  { id: "cottage", label: "Cottage", icon: TreePine },
  { id: "barn", label: "Barn Conversion", icon: Warehouse },
];

const tenureOptions = [
  { id: "freehold", label: "Freehold" },
  { id: "leasehold", label: "Leasehold" },
  { id: "shareOfFreehold", label: "Share of Freehold" },
];

const addedSinceOptions = [
  { id: "24h", label: "Last 24 hours" },
  { id: "3d", label: "Last 3 days" },
  { id: "7d", label: "Last week" },
  { id: "30d", label: "Last month" },
];

const bedroomOptions = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

export default function SearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  isMobile,
  onClose,
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 5000000,
  ]);

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onFilterChange({
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    });
  };

  const handlePropertyTypeToggle = (typeId: string) => {
    const current = filters.propertyType || [];
    const updated = current.includes(typeId)
      ? current.filter((t) => t !== typeId)
      : [...current, typeId];
    onFilterChange({ propertyType: updated });
  };

  const handleBedroomSelect = (beds: number) => {
    onFilterChange({ beds: filters.beds === beds ? undefined : beds });
  };

  return (
    <div className={cn("bg-white", isMobile ? "p-4" : "p-6")}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-[#4AC8E8] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h3 className="text-sm font-medium mb-3">Price Range</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className="pl-6"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className="pl-6"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <h3 className="text-sm font-medium mb-3">Bedrooms</h3>
          <div className="flex flex-wrap gap-2">
            {bedroomOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBedroomSelect(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                  filters.beds === option.value
                    ? "bg-[#4AC8E8] text-white border-[#4AC8E8]"
                    : "border-gray-200 hover:border-[#4AC8E8]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h3 className="text-sm font-medium mb-3">Property Type</h3>
          <div className="space-y-2">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = filters.propertyType?.includes(type.id);
              return (
                <label
                  key={type.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    isSelected ? "bg-[#4AC8E8]/10" : "hover:bg-gray-50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handlePropertyTypeToggle(type.id)}
                  />
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{type.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Tenure */}
        <div>
          <h3 className="text-sm font-medium mb-3">Tenure</h3>
          <div className="space-y-2">
            {tenureOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tenure"
                  value={option.id}
                  checked={filters.tenure === option.id}
                  onChange={(e) => onFilterChange({ tenure: e.target.value })}
                  className="text-[#4AC8E8] focus:ring-[#4AC8E8]"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <h3 className="text-sm font-medium mb-3">Keywords</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="e.g. garden, parking..."
              value={filters.keywords || ""}
              onChange={(e) => onFilterChange({ keywords: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date Added */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Added
          </h3>
          <select
            value={filters.addedSince || ""}
            onChange={(e) => onFilterChange({ addedSince: e.target.value || undefined })}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4AC8E8] focus:border-transparent"
          >
            <option value="">Any time</option>
            {addedSinceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Include Sold/Let */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.includeArchived}
            onCheckedChange={(checked) =>
              onFilterChange({ includeArchived: checked as boolean })
            }
          />
          <span className="text-sm">Include sold/let properties</span>
        </label>
      </div>

      {/* Mobile Actions */}
      {isMobile && (
        <div className="mt-6 pt-4 border-t space-y-2">
          <Button
            onClick={onClose}
            className="w-full bg-[#4AC8E8] hover:bg-[#1A9BBF]"
          >
            Show Results
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
