"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Home } from "lucide-react";
import PropertySearchBar from "@/components/property/PropertySearchBarView";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { usePropertySearchResults } from "@/hooks/usePropertySearchResults";
import PropertyMap from "@/components/PropertyMap";

// ============================================
// Main Page Component
// ============================================

type ViewMode = "grid" | "list" | "map";

function LettingsPropertiesPageContent() {
  const reduceMotion = useReducedMotion();
  const {
    query,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    setPage,
    recoverOutOfRangePage,
    submitSearch,
  } = useSearchFilters({
    department: "lettings",
    debounceMs: 300,
  });
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const { result, isLoading, error, retry } = usePropertySearchResults(query, {
    onOutOfRangePage: recoverOutOfRangePage,
  });
  const properties = result?.properties ?? [];

  return (
    <div className="bg-white text-banc-dark min-h-screen">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-banc-dark-deep">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hertfordshire-home-1.png"
            alt="Premium property to rent"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/70 via-banc-dark-deep/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-banc-sky mb-2">To Let</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl font-heading">
              Properties to Rent
            </h1>
            <p className="mt-2 text-white/70">
              Discover exceptional rental properties across Hertfordshire and North London
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="relative z-10 -mt-8 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <PropertySearchBar
            department="lettings"
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
              className="mb-5 flex items-center gap-2 text-sm text-banc-focus"
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
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-banc-focus" />
                <p className="text-banc-muted-readable">Loading live properties…</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="rounded-2xl border border-banc-line bg-banc-grey-pale px-6 py-16 text-center"
                role="alert"
              >
                <AlertCircle className="mx-auto mb-5 h-10 w-10 text-banc-focus" />
                <h2 className="text-xl font-semibold text-banc-dark-deep">
                  Live listings are temporarily unavailable
                </h2>
                <p className="mx-auto mt-2 max-w-md text-banc-muted-readable">
                  Please try again shortly. Your search filters have been kept.
                </p>
                <Button
                  type="button"
                  onClick={retry}
                  className="mt-6 min-h-11 bg-banc-focus text-white hover:bg-banc-focus-hover focus-visible:ring-banc-focus"
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
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-banc-grey-pale">
                  <Home className="h-8 w-8 text-banc-muted-readable" />
                </div>
                <h2 className="text-xl font-semibold text-banc-dark-deep">
                  No rental properties match this search
                </h2>
                <p className="mx-auto mb-6 mt-2 max-w-md text-banc-muted-readable">
                  Try widening the location or removing one filter to see more homes.
                </p>
                <Button
                  type="button"
                  onClick={clearFilters}
                  variant="outline"
                  className="min-h-11 border-banc-focus text-banc-focus hover:border-banc-focus-hover hover:text-banc-focus-hover focus-visible:ring-banc-focus"
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
                        : "h-[600px] overflow-hidden rounded-2xl bg-banc-grey-pale"
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
          className="border-t border-banc-line px-6 py-8 lg:px-10"
          aria-label="Property result pages"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-banc-muted-readable text-banc-dark-deep hover:border-banc-focus focus-visible:ring-banc-focus"
              onClick={() => setPage(result.page - 1)}
              disabled={isLoading || result.page <= 1}
            >
              Previous
            </Button>
            <span className="px-2 text-sm font-medium text-banc-muted-readable" aria-live="polite">
              Page {result.page} of {result.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-banc-muted-readable text-banc-dark-deep hover:border-banc-focus focus-visible:ring-banc-focus"
              onClick={() => setPage(result.page + 1)}
              disabled={isLoading || result.page >= result.totalPages}
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      {/* Tenant Registration CTA */}
      <section className="bg-banc-sky py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mt-4 text-white/90">
            Register your requirements and we&apos;ll notify you when matching properties become available.
          </p>
          <Button className="mt-6 bg-white text-banc-sky hover:bg-white/90 px-8 py-5">
            Register as a Tenant
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function LettingsPropertiesPage() {
  return (
    <Suspense fallback={
      <div className="bg-white text-banc-dark min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-banc-sky" />
        </div>
        <Footer />
      </div>
    }>
      <LettingsPropertiesPageContent />
    </Suspense>
  );
}
