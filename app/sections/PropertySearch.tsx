"use client";

import * as React from "react";
import Link from "next/link";
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
import {
  HOME_POPULAR_AREAS,
  buildPopularAreaHref,
  formatListingCount,
} from "@/lib/home-search";
import { useListingCount } from "@/hooks/useListingCount";
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

  const department = query.department;
  const countLine = formatListingCount(department, useListingCount(department));

  const handleSearch = React.useCallback(() => {
    router.push(buildHomeSearchSubmission(query.department, filters));
  }, [filters, query.department, router]);

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
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[11px] tracking-[0.14em] text-white/60">01</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--banc-focus-dark)]">
                Search
              </span>
            </div>
            <h2
              className="font-display font-light leading-[1.05] tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(32px, 3.5vw, 44px)" }}
            >
              Find your next property
            </h2>
            <p className="min-h-6 text-sm text-white/70" aria-live="polite">
              {countLine}
            </p>
          </div>

          <div
            className="grid w-full grid-cols-2 rounded-xl border border-white/30 p-1 sm:w-fit"
            role="group"
            aria-label="Search properties to buy or rent"
          >
            <button
              type="button"
              aria-pressed={department === "sales"}
              onClick={() => handleDepartmentChange("sales")}
                className={`min-h-11 rounded-lg px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep sm:min-w-28 ${
                  department === "sales"
                    ? "bg-white text-banc-dark-deep"
                    : "text-white/75 hover:text-white"
                }`}
            >
              Buy
            </button>
            <button
              type="button"
              aria-pressed={department === "lettings"}
              onClick={() => handleDepartmentChange("lettings")}
                className={`min-h-11 rounded-lg px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-banc-dark-deep sm:min-w-28 ${
                  department === "lettings"
                    ? "bg-white text-banc-dark-deep"
                    : "text-white/75 hover:text-white"
                }`}
            >
              Rent
            </button>
          </div>

          <PropertySearchBarView
            department={department}
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

          <nav
            aria-label="Popular areas"
            className="flex flex-wrap items-center gap-x-5 border-t border-white/15 pt-3 text-sm"
          >
            <span className="text-white/60">Popular</span>
            {HOME_POPULAR_AREAS.map((area) => (
              <Link
                key={area}
                href={buildPopularAreaHref(department, area)}
                className="inline-flex min-h-11 items-center text-white underline decoration-white/40 underline-offset-4 transition-colors duration-200 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)]"
              >
                {area}
              </Link>
            ))}
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
