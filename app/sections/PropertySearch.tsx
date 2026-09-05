"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PropertySearchBarView } from "@/components/property";
import {
  applyPropertySearchFilterPatch,
  buildHomeSearchSubmission,
  getPropertySearchFilters,
} from "@/lib/property-search/navigation";
import {
  createDefaultPropertySearchQuery,
  hasActivePropertyFilters,
  switchSearchDepartment,
} from "@/lib/property-search/query";
import type {
  PropertyDepartment,
  PropertySearchFilters,
} from "@/lib/property-search/types";

export default function PropertySearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState(() =>
    createDefaultPropertySearchQuery("sales"),
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
    setQuery((current) =>
      createDefaultPropertySearchQuery(current.department),
    );
  }, []);

  const handleDepartmentChange = React.useCallback(
    (department: PropertyDepartment) => {
      setQuery((current) => switchSearchDepartment(current, department));
    },
    [],
  );

  const handleSearch = React.useCallback(() => {
    router.push(buildHomeSearchSubmission(query.department, filters));
  }, [filters, query.department, router]);

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
            <div className="flex flex-col gap-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-banc-muted-readable">
                Search
              </p>
              <h2
                className="font-display font-light leading-[1.05] tracking-[-0.02em] text-banc-dark"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
              >
                Find your next property
              </h2>
            </div>

            <div
              className="inline-flex w-fit rounded-xl border border-banc-line bg-white p-1"
              role="group"
              aria-label="Search properties to buy or rent"
            >
              <button
                type="button"
                aria-pressed={query.department === "sales"}
                onClick={() => handleDepartmentChange("sales")}
                className={`min-h-11 min-w-24 rounded-lg px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 ${
                  query.department === "sales"
                    ? "bg-banc-focus text-white"
                    : "text-banc-muted-readable hover:bg-banc-grey-pale hover:text-banc-dark-deep"
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                aria-pressed={query.department === "lettings"}
                onClick={() => handleDepartmentChange("lettings")}
                className={`min-h-11 min-w-24 rounded-lg px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 ${
                  query.department === "lettings"
                    ? "bg-banc-focus text-white"
                    : "text-banc-muted-readable hover:bg-banc-grey-pale hover:text-banc-dark-deep"
                }`}
              >
                Rent
              </button>
            </div>

            <PropertySearchBarView
              department={query.department}
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
