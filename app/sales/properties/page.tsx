"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Map, Loader2 } from "lucide-react";

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

// ============================================
// Sample Properties Data
// ============================================

const allProperties = [
  {
    id: "the-laurels-hadley-wood",
    title: "The Laurels",
    address: "Hadley Wood, EN4",
    price: "£2,450,000",
    priceNum: 2450000,
    tags: ["New Listing", "Premium", "Video Tour"],
    stats: { beds: 5, baths: 4, sqft: 3820, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    floorplanImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    summary: "Elegant modern residence with landscaped gardens and seamless indoor-outdoor living.",
    propertyType: "house",
    features: { garden: true, parking: true, garage: true, videoTour: true },
    addedDate: "2026-02-25",
  },
  {
    id: "mayfair-penthouse-mount-street",
    title: "Mayfair Penthouse",
    address: "Mount Street, W1",
    price: "£3,900,000",
    priceNum: 3900000,
    tags: ["Premium", "Video Tour"],
    stats: { beds: 3, baths: 3, sqft: 2100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    floorplanImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    summary: "Light-filled penthouse with panoramic views, concierge service, and private terrace.",
    propertyType: "flat",
    features: { parking: true, videoTour: true },
    addedDate: "2026-02-20",
  },
  {
    id: "cuffley-house-hertfordshire",
    title: "Cuffley House",
    address: "Cuffley, Hertfordshire",
    price: "£1,350,000",
    priceNum: 1350000,
    tags: ["New Listing", "Premium"],
    stats: { beds: 4, baths: 3, sqft: 2600, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1577086664693-8945ed4d2d7c?auto=format&fit=crop&w=1600&q=80",
    summary: "Characterful family home with open-plan living, media room, and expansive gardens.",
    propertyType: "house",
    features: { garden: true, parking: true, periodFeatures: true },
    addedDate: "2026-02-26",
  },
  {
    id: "woodland-manor-brookmans-park",
    title: "Woodland Manor",
    address: "Brookmans Park, AL9",
    price: "£1,850,000",
    priceNum: 1850000,
    tags: ["Premium", "Gardens"],
    stats: { beds: 5, baths: 4, sqft: 3200, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    summary: "Stunning detached residence set within mature grounds with woodland views and triple garage.",
    propertyType: "house",
    features: { garden: true, parking: true, garage: true },
    addedDate: "2026-02-15",
  },
  {
    id: "the-old-rectory-potters-bar",
    title: "The Old Rectory",
    address: "Potters Bar, EN6",
    price: "£2,100,000",
    priceNum: 2100000,
    tags: ["Period Property", "Grade II"],
    stats: { beds: 6, baths: 3, sqft: 4100, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1577086664693-8945ed4d2d7c?auto=format&fit=crop&w=1600&q=80",
    summary: "Impressive Grade II listed former rectory with period features, modernised throughout.",
    propertyType: "house",
    features: { garden: true, parking: true, periodFeatures: true, fireplace: true },
    addedDate: "2026-02-10",
  },
  {
    id: "parkside-apartment-mayfair",
    title: "Parkside Apartment",
    address: "Mayfair, W1K",
    price: "£1,650,000",
    priceNum: 1650000,
    tags: ["Apartment", "Park View"],
    stats: { beds: 2, baths: 2, sqft: 1100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    summary: "Elegant two-bedroom apartment overlooking Hyde Park with concierge and underground parking.",
    propertyType: "flat",
    features: { parking: true },
    addedDate: "2026-02-22",
  },
  {
    id: "modern-bungalow-cuffley",
    title: "Modern Bungalow",
    address: "Cuffley, Hertfordshire",
    price: "£950,000",
    priceNum: 950000,
    tags: ["New Listing", "Bungalow"],
    stats: { beds: 3, baths: 2, sqft: 1400, epc: "A" },
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Stunning modern bungalow with open-plan living, large garden and off-street parking.",
    propertyType: "bungalow",
    features: { garden: true, parking: true, newBuild: true },
    addedDate: "2026-02-27",
  },
  {
    id: "riverside-maisonette",
    title: "Riverside Maisonette",
    address: "Brookmans Park, AL9",
    price: "£750,000",
    priceNum: 750000,
    tags: ["Maisonette", "Chain Free"],
    stats: { beds: 2, baths: 1, sqft: 900, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Charming two-storey maisonette with river views, modern kitchen and chain-free sale.",
    propertyType: "maisonette",
    features: { chainFree: true },
    addedDate: "2026-02-24",
  },
  {
    id: "development-land-enfield",
    title: "Development Land",
    address: "Enfield, EN2",
    price: "£1,200,000",
    priceNum: 1200000,
    tags: ["Land", "Development"],
    stats: { beds: 0, baths: 0, sqft: 21780, epc: "N/A" },
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "0.5 acre development plot with planning permission for 4-bedroom detached house.",
    propertyType: "land",
    features: {},
    addedDate: "2026-02-18",
  },
  {
    id: "commercial-retail-unit",
    title: "Prime Retail Unit",
    address: "Potters Bar, EN6",
    price: "£450,000",
    priceNum: 450000,
    tags: ["Commercial", "Investment"],
    stats: { beds: 0, baths: 1, sqft: 1200, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "High-street retail unit with A1 use, rear storage and parking for 2 vehicles.",
    propertyType: "commercial",
    features: { parking: true },
    addedDate: "2026-02-12",
  },
  {
    id: "victorian-terrace",
    title: "Victorian Terrace",
    address: "Cuffley, Hertfordshire",
    price: "£675,000",
    priceNum: 675000,
    tags: ["Period Property", "Reduced"],
    stats: { beds: 3, baths: 1, sqft: 1100, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Beautifully preserved Victorian terrace with original fireplaces and modern extension.",
    propertyType: "house",
    features: { periodFeatures: true, fireplace: true, garden: true },
    addedDate: "2026-01-15",
    reduced: true,
  },
  {
    id: "luxury-apartment-w1",
    title: "Luxury Studio Apartment",
    address: "Mayfair, W1",
    price: "£550,000",
    priceNum: 550000,
    tags: ["Apartment", "Virtual Tour"],
    stats: { beds: 0, baths: 1, sqft: 450, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Stunning studio apartment in prime Mayfair location with 24-hour concierge.",
    propertyType: "flat",
    features: { virtualTour: true },
    addedDate: "2026-02-23",
  },
];

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
  const { filters, setFilters, clearFilters, hasActiveFilters, isLoading } = useSearchFilters({
    debounceMs: 300,
  });
  
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  // Filter and sort properties
  const filteredProperties = React.useMemo(() => {
    const filtered = filterProperties(allProperties, filters);
    return sortProperties(filtered, filters.sortBy);
  }, [filters]);

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
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={{
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.08 },
                    },
                  }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                      : viewMode === "list"
                      ? "flex flex-col gap-6"
                      : "h-[600px] bg-[#F4F3F1] rounded-2xl flex items-center justify-center"
                  }
                >
                  {viewMode === "map" ? (
                    <div className="text-center">
                      <Map className="w-12 h-12 text-[#E0DFDC] mx-auto mb-4" />
                      <p className="text-[#8A8880]">Map view coming soon</p>
                    </div>
                  ) : (
                    filteredProperties.map((property) => (
                      <motion.div
                        key={property.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 },
                        }}
                        className={viewMode === "list" ? "w-full" : ""}
                      >
                        <PropertyCard {...property} />
                      </motion.div>
                    ))
                  )}
                </motion.div>
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
