"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PropertySearchBarView } from "@/components/property";
import {
  applyPropertySearchFilterPatch,
  buildPropertyResultsHref,
  getPropertySearchFilters,
} from "@/lib/property-search/navigation";
import {
  createDefaultPropertySearchQuery,
  hasActivePropertyFilters,
} from "@/lib/property-search/query";
import type { PropertySearchFilters } from "@/lib/property-search/types";

interface LettingsPropertySearchProps {
  variant?: "hero" | "section";
}

export default function LettingsPropertySearch({ variant = "section" }: LettingsPropertySearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(() =>
    createDefaultPropertySearchQuery("lettings"),
  );
  const filters = React.useMemo(() => getPropertySearchFilters(query), [query]);
  const hasActiveFilters = React.useMemo(
    () => hasActivePropertyFilters(query),
    [query],
  );

  const handleFilterChange = React.useCallback(
    (patch: Partial<PropertySearchFilters>) => {
      setQuery((current) => applyPropertySearchFilterPatch(current, patch));
    },
    [],
  );

  const handleClearFilters = React.useCallback(() => {
    setQuery(createDefaultPropertySearchQuery("lettings"));
  }, []);

  const handleSearch = React.useCallback(() => {
    router.push(buildPropertyResultsHref(query));
  }, [query, router]);

  if (variant === "hero") {
    return (
      <div className="w-full">
        <PropertySearchBarView
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
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[#8A8880] font-heading">
                Search Rentals
              </p>
              <h2 className="text-2xl font-semibold text-[#1A1917] sm:text-3xl font-heading">
                Find your perfect rental
              </h2>
            </div>

            <PropertySearchBarView
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
