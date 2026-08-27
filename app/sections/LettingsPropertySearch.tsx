"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// New professional search components
import {
  PropertySearchBar,
  type SearchFilters,
} from "@/components/property";

// Lettings-specific price ranges (monthly rent)
const LETTINGS_PRICE_OPTIONS = [
  { value: 0, label: "No min" },
  { value: 500, label: "£500" },
  { value: 750, label: "£750" },
  { value: 1000, label: "£1,000" },
  { value: 1250, label: "£1,250" },
  { value: 1500, label: "£1,500" },
  { value: 1750, label: "£1,750" },
  { value: 2000, label: "£2,000" },
  { value: 2500, label: "£2,500" },
  { value: 3000, label: "£3,000" },
  { value: 4000, label: "£4,000" },
  { value: 5000, label: "£5,000" },
  { value: 7500, label: "£7,500" },
  { value: 10000, label: "£10,000" },
];

// ============================================
// Lettings Search Component
// ============================================

interface LettingsPropertySearchProps {
  variant?: "hero" | "section";
}

export default function LettingsPropertySearch({ variant = "section" }: LettingsPropertySearchProps) {
  const router = useRouter();

  // Local state for filters (not URL-synced on homepage)
  const [filters, setFilters] = React.useState<SearchFilters>({});

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.location !== undefined ||
      filters.radius !== undefined ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.minBeds !== undefined ||
      filters.maxBeds !== undefined ||
      filters.minBaths !== undefined ||
      filters.maxBaths !== undefined ||
      (filters.propertyType?.length ?? 0) > 0 ||
      (filters.tenure?.length ?? 0) > 0 ||
      Object.values(filters.features || {}).some(Boolean)
    );
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = React.useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev };

      // Handle special case for features (merge instead of replace)
      if (newFilters.features) {
        updated.features = { ...prev.features, ...newFilters.features };
      }

      // Apply all other filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (key !== "features") {
          if (value === undefined) {
            delete (updated as Record<string, unknown>)[key];
          } else {
            (updated as Record<string, unknown>)[key] = value;
          }
        }
      });

      return updated;
    });
  }, []);

  // Clear all filters
  const handleClearFilters = React.useCallback(() => {
    setFilters({});
  }, []);

  // Build query params and navigate to lettings properties page
  const buildQueryString = (currentFilters: SearchFilters): string => {
    const params = new URLSearchParams();

    // Location
    if (currentFilters.location) params.set("location", currentFilters.location);

    // Radius
    if (currentFilters.radius !== undefined) params.set("radius", currentFilters.radius.toString());

    // Price (rent pcm)
    if (currentFilters.minPrice !== undefined) params.set("minPrice", currentFilters.minPrice.toString());
    if (currentFilters.maxPrice !== undefined) params.set("maxPrice", currentFilters.maxPrice.toString());

    // Bedrooms
    if (currentFilters.minBeds !== undefined) params.set("minBeds", currentFilters.minBeds.toString());
    if (currentFilters.maxBeds !== undefined) params.set("maxBeds", currentFilters.maxBeds.toString());

    // Bathrooms
    if (currentFilters.minBaths !== undefined) params.set("minBaths", currentFilters.minBaths.toString());
    if (currentFilters.maxBaths !== undefined) params.set("maxBaths", currentFilters.maxBaths.toString());

    // Property Type
    if (currentFilters.propertyType?.length) {
      params.set("propertyType", currentFilters.propertyType.join(","));
    }

    // Features
    if (currentFilters.features) {
      Object.entries(currentFilters.features).forEach(([key, value]) => {
        if (value) params.set(key, "true");
      });
    }

    // Sort
    if (currentFilters.sortBy) params.set("sortBy", currentFilters.sortBy);

    return params.toString();
  };

  // Handle search - navigate to lettings properties page
  const handleSearch = React.useCallback(() => {
    const queryString = buildQueryString(filters);
    router.push(`/lettings/properties${queryString ? `?${queryString}` : ""}`);
  }, [filters, router]);

  if (variant === "hero") {
    return (
      <div className="w-full">
        <PropertySearchBar
          department="lettings"
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          hasActiveFilters={hasActiveFilters}
          isLoading={false}
          showMapButton={false}
        />
      </div>
    );
  }

  return (
    <section className="relative bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 pb-6 pt-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-[#E0DFDC] bg-[#F4F3F1] p-6 shadow-sm lg:p-10"
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[#8A8880] font-heading">
                Search Rentals
              </p>
              <h2 className="text-2xl font-semibold text-[#1A1917] sm:text-3xl font-heading">
                Find your perfect rental
              </h2>
            </div>

            {/* Professional Search Bar */}
            <PropertySearchBar
              department="lettings"
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onSearch={handleSearch}
              hasActiveFilters={hasActiveFilters}
              isLoading={false}
              showMapButton={false}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Export lettings-specific price options for use in other components
export { LETTINGS_PRICE_OPTIONS };
