"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { AlertCircle, Grid3X3, Loader2 } from "lucide-react";
import PropertySearchBar from "@/components/property/PropertySearchBarView";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { usePropertySearchResults } from "@/hooks/usePropertySearchResults";
import PropertyMap from "@/components/PropertyMap";

// ============================================
// Main Page Component
// ============================================

type ViewMode = "grid" | "list" | "map";

function SalesPropertiesPageContent() {
  const reduceMotion = useReducedMotion();
  const {
    query,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    setPage,
    submitSearch,
  } = useSearchFilters({
    department: "sales",
    debounceMs: 300,
  });
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const { result, isLoading, error, retry } = usePropertySearchResults(query);
  const properties = result?.properties ?? [];

  return (
    <div className="bg-white text-[#2C2A27] min-h-screen">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#1A1917]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hertfordshire-home-1.png"
            alt="Premium property for sale"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/70 via-[#1A1917]/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[#4AC8E8] mb-2">For Sale</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl font-heading">
              Properties for Sale
            </h1>
            <p className="mt-2 text-white/70">
              Discover exceptional homes across Hertfordshire and North London
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="relative z-10 -mt-8 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <PropertySearchBar
            department="sales"
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
            onSearch={submitSearch}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading}
            resultCount={result?.total}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </section>

      <section
        className="px-4 py-8 sm:px-6 sm:py-12 lg:px-10"
        aria-busy={isLoading}
      >
        <div className="mx-auto max-w-7xl">
          {isLoading && result !== null && (
            <div
              className="mb-5 flex items-center gap-2 text-sm text-[#0B6F89]"
              role="status"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating live results…
            </div>
          )}
          <AnimatePresence mode="wait">
            {isLoading && result === null ? (
              <motion.div
                key="loading"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
                role="status"
              >
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#0B6F89]" />
                <p className="text-[#5F5D57]">Loading live properties…</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="rounded-2xl border border-[#E0DFDC] bg-[#F4F3F1] px-6 py-16 text-center"
                role="alert"
              >
                <AlertCircle className="mx-auto mb-5 h-10 w-10 text-[#0B6F89]" />
                <h2 className="text-xl font-semibold text-[#1A1917]">
                  Live listings are temporarily unavailable
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[#5F5D57]">
                  Please try again shortly. Your search filters have been kept.
                </p>
                <Button
                  type="button"
                  onClick={retry}
                  className="mt-6 min-h-11 bg-[#0B6F89] text-white hover:bg-[#075E75] focus-visible:ring-[#0B6F89]"
                >
                  Retry live search
                </Button>
              </motion.div>
            ) : result?.total === 0 ? (
              <motion.div
                key="empty"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="py-20 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F3F1]">
                  <Grid3X3 className="h-8 w-8 text-[#5F5D57]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1917]">
                  No properties match this search
                </h2>
                <p className="mx-auto mb-6 mt-2 max-w-md text-[#5F5D57]">
                  Try widening the location or removing one filter to see more homes.
                </p>
                <Button
                  type="button"
                  onClick={clearFilters}
                  variant="outline"
                  className="min-h-11 border-[#0B6F89] text-[#0B6F89] hover:border-[#075E75] hover:text-[#075E75] focus-visible:ring-[#0B6F89]"
                >
                  Clear all filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.3 }}
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
                      : viewMode === "list"
                        ? "flex flex-col gap-6"
                        : "h-[600px] overflow-hidden rounded-2xl bg-[#F4F3F1]"
                  }
                >
                  {viewMode === "map" ? (
                    <PropertyMap properties={properties} />
                  ) : (
                    properties.map((property) => (
                      <motion.div
                        key={property.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={reduceMotion ? undefined : { duration: 0.4 }}
                        className={viewMode === "list" ? "w-full" : ""}
                      >
                        <PropertyCard
                          {...property}
                          variant={viewMode === "list" ? "list" : "grid"}
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {result !== null && result.totalPages > 1 && !error && (
        <nav
          className="border-t border-[#E0DFDC] px-6 py-8 lg:px-10"
          aria-label="Property result pages"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-[#5F5D57] text-[#1A1917] hover:border-[#0B6F89] focus-visible:ring-[#0B6F89]"
              onClick={() => setPage(query.page - 1)}
              disabled={isLoading || query.page <= 1}
            >
              Previous
            </Button>
            <span className="px-2 text-sm font-medium text-[#5F5D57]" aria-live="polite">
              Page {query.page} of {result.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-[#5F5D57] text-[#1A1917] hover:border-[#0B6F89] focus-visible:ring-[#0B6F89]"
              onClick={() => setPage(query.page + 1)}
              disabled={isLoading || query.page >= result.totalPages}
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      <Footer />
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function SalesPropertiesPage() {
  return (
    <Suspense fallback={
      <div className="bg-white text-[#2C2A27] min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#4AC8E8]" />
        </div>
        <Footer />
      </div>
    }>
      <SalesPropertiesPageContent />
    </Suspense>
  );
}
