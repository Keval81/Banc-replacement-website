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
import { eyebrowOnDark, sectionHeadingOnDark } from "@/components/ui/form-styles";

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

  const searchBar = (
    <PropertySearchBarView
      department="lettings"
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onSearch={handleSearch}
      hasActiveFilters={hasActiveFilters}
      isLoading={false}
      showMapButton={false}
      tone="dark"
      className="overflow-visible"
    />
  );

  // The hero variant sits inside a dark PageBand, which supplies the ground.
  if (variant === "hero") {
    return <div className="w-full">{searchBar}</div>;
  }

  return (
    <section className="relative bg-banc-dark-deep text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-5 lg:gap-6"
        >
          <div className="flex flex-col gap-3">
            <p className={eyebrowOnDark}>Search Rentals</p>
            <h2 className={sectionHeadingOnDark}>Find your perfect rental</h2>
          </div>

          {searchBar}
        </motion.div>
      </div>
    </section>
  );
}
