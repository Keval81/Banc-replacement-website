"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Loader2 } from "lucide-react";

// New search components
import {
  PropertySearchBar,
  AdvancedSearch,
  QuickFilters,
  ActiveFilters,
  MobileFilterDrawer,
  type SearchFilters,
} from "@/components/property";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import PropertyMap from "@/components/PropertyMap";

// ============================================
// Sample Properties Data
// ============================================

// Live listings come from /api/properties (Expert Agent feed -> Supabase).
// The item shape mirrors what PropertyCard and the filter pipeline expect.
interface SiteProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  priceNum: number;
  tags: string[];
  stats: { beds: number; baths: number; sqft?: number; epc?: string };
  images: string[];
  summary: string;
  propertyType: string;
  features: Record<string, boolean>;
  addedDate: string;
  department: "sales";
}

const allProperties: SiteProperty[] = [];

function useLiveProperties() {
  const [properties, setProperties] = React.useState<SiteProperty[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/properties?department=sales")
      .then((r) => (r.ok ? r.json() : { properties: [] }))
      .then((d) => {
        if (cancelled) return;
        const mapped: SiteProperty[] = (d.properties ?? []).map(
          (c: SiteProperty & { featureFlags?: Record<string, boolean> }) => ({
            ...c,
            features: c.featureFlags ?? {},
          })
        );
        setProperties(mapped);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return { properties, loaded };
}

// ============================================
// Filter Logic
// ============================================

function filterProperties(properties: typeof allProperties, filters: SearchFilters) {
  return properties.filter((property) => {
    // Location filter
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      const addressMatch = property.address.toLowerCase().includes(searchTerm);
      const titleMatch = property.title.toLowerCase().includes(searchTerm);
      if (!addressMatch && !titleMatch) return false;
    }

    // Price filters
    if (filters.minPrice !== undefined && property.priceNum < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && property.priceNum > filters.maxPrice) return false;

    // Bedroom filters
    if (filters.minBeds !== undefined && property.stats.beds < filters.minBeds) return false;
    if (filters.maxBeds !== undefined && property.stats.beds > filters.maxBeds) return false;

    // Bathroom filters
    if (filters.minBaths !== undefined && property.stats.baths < filters.minBaths) return false;
    if (filters.maxBaths !== undefined && property.stats.baths > filters.maxBaths) return false;

    // Property type filter
    if (filters.propertyType?.length) {
      if (!filters.propertyType.includes(property.propertyType)) return false;
    }

    // Features filter
    if (filters.features) {
      for (const [key, value] of Object.entries(filters.features)) {
        if (value && !property.features[key as keyof typeof property.features]) {
          return false;
        }
      }
    }

    return true;
  });
}

function sortProperties(properties: typeof allProperties, sortBy?: SearchFilters["sortBy"]) {
  const sorted = [...properties];
  
  switch (sortBy) {
    case "price_asc":
      sorted.sort((a, b) => a.priceNum - b.priceNum);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.priceNum - a.priceNum);
      break;
    case "newest":
      sorted.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
      break;
    case "reduced":
      // Put reduced properties first, then sort by date
      sorted.sort((a, b) => {
        const aReduced = (a as typeof a & { reduced?: boolean }).reduced ? 1 : 0;
        const bReduced = (b as typeof b & { reduced?: boolean }).reduced ? 1 : 0;
        if (aReduced !== bReduced) return bReduced - aReduced;
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      });
      break;
    case "popular":
      // Sort by number of tags (more tags = more popular for demo)
      sorted.sort((a, b) => b.tags.length - a.tags.length);
      break;
    default:
      // Default to newest
      sorted.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
  }
  
  return sorted;
}

// ============================================
// Main Page Component
// ============================================

type ViewMode = "grid" | "list" | "map";

function SalesPropertiesPageContent() {
  const reduceMotion = useReducedMotion();
  const { filters, setFilters, clearFilters, hasActiveFilters, isLoading } = useSearchFilters({
    debounceMs: 300,
  });
  
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const { properties: liveProperties, loaded } = useLiveProperties();

  // Filter and sort properties
  const filteredProperties = React.useMemo(() => {
    const filtered = filterProperties(liveProperties, filters);
    return sortProperties(filtered, filters.sortBy);
  }, [liveProperties, filters]);

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
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading}
            resultCount={filteredProperties.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="w-10 h-10 text-[#4AC8E8] animate-spin mb-4" />
                <p className="text-[#8A8880]">Loading properties...</p>
              </motion.div>
            ) : filteredProperties.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F4F3F1] flex items-center justify-center">
                  <Grid3X3 className="w-8 h-8 text-[#E0DFDC]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1917] mb-2">
                  No properties found
                </h3>
                <p className="text-[#8A8880] max-w-md mx-auto mb-6">
                  We couldn&apos;t find any properties matching your current filters. 
                  Try adjusting your search criteria or clearing some filters.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-[#4AC8E8] text-[#4AC8E8] hover:bg-[#4AC8E8] hover:text-white"
                >
                  Clear all filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Reveal is per-card: a whole-grid whileInView threshold can
                    never fire once the grid is taller than ~10 viewports
                    (100 live listings), leaving every card at opacity 0. */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                      : viewMode === "list"
                      ? "flex flex-col gap-6"
                      : "h-[600px] bg-[#F4F3F1] rounded-2xl overflow-hidden"
                  }
                >
                  {viewMode === "map" ? (
                    <PropertyMap properties={filteredProperties} />
                  ) : (
                    filteredProperties.map((property) => (
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

      {/* Pagination */}
      {filteredProperties.length > 0 && (
        <section className="border-t border-[#E0DFDC] py-8 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" className="border-[#E0DFDC]" disabled>
                Previous
              </Button>
              <Button className="bg-[#4AC8E8] text-white">1</Button>
              <Button variant="outline" className="border-[#E0DFDC]">2</Button>
              <Button variant="outline" className="border-[#E0DFDC]">3</Button>
              <Button variant="outline" className="border-[#E0DFDC]">
                Next
              </Button>
            </div>
          </div>
        </section>
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
