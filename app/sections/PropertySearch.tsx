"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// New professional search components
import {
  PropertySearchBar,
  type SearchFilters,
} from "@/components/property";

// ============================================
// Homepage Search Component
// ============================================

export default function PropertySearch() {
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

  // Build query params and navigate to properties page
  const buildQueryString = (currentFilters: SearchFilters): string => {
    const params = new URLSearchParams();

    // Location
    if (currentFilters.location) params.set("location", currentFilters.location);

    // Radius
    if (currentFilters.radius !== undefined) params.set("radius", currentFilters.radius.toString());

    // Price
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

    // Tenure
    if (currentFilters.tenure?.length) {
      params.set("tenure", currentFilters.tenure.join(","));
    }

    // Features
    if (currentFilters.features) {
      Object.entries(currentFilters.features).forEach(([key, value]) => {
        if (value) params.set(key, "true");
      });
    }

    return params.toString();
  };

  // Handle search - navigate to properties page with filters
  const handleSearch = React.useCallback(() => {
    const queryString = buildQueryString(filters);
    router.push(`/sales/properties${queryString ? `?${queryString}` : ""}`);
  }, [filters, router]);

  // Custom onFilterChange that also triggers search on location submit
  const handleFilterChangeWithSearch = React.useCallback((newFilters: Partial<SearchFilters>) => {
    handleFilterChange(newFilters);
    
    // If location is being set (search submitted), navigate to properties page
    if (newFilters.location !== undefined) {
      const updatedFilters = { ...filters, ...newFilters };
      const queryString = buildQueryString(updatedFilters);
      router.push(`/sales/properties${queryString ? `?${queryString}` : ""}`);
    }
  }, [filters, handleFilterChange, router]);

  return (
    <section className="relative bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[10px] border border-banc-dark/15 bg-banc-grey-pale p-6 lg:p-10"
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-banc-grey">
                Search
              </p>
              <h2
                className="font-serif font-light leading-[1.05] tracking-[-0.02em] text-banc-dark"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
              >
                Find your next property
              </h2>
            </div>

            {/* New Professional Search Bar */}
            <PropertySearchBar
              department="sales"
              filters={filters}
              onFilterChange={handleFilterChangeWithSearch}
              onClearFilters={handleClearFilters}
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
