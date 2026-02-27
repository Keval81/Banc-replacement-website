"use client";

import * as React from "react";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Map, Loader2, Home } from "lucide-react";

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
// Sample Lettings Properties Data
// ============================================

const allLettingsProperties = [
  {
    id: "modern-townhouse-cuffley",
    title: "Modern Townhouse",
    address: "Cuffley, EN6",
    price: "£2,850 pcm",
    priceNum: 2850,
    tags: ["New Listing", "Furnished"],
    stats: { beds: 4, baths: 3, sqft: 1800, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    floorplanImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    summary: "Stunning modern townhouse with integrated garage, private garden, and modern kitchen.",
    propertyType: "house",
    features: { garden: true, parking: true, garage: true, furnished: true },
    addedDate: "2026-02-25",
    lettingType: "long_term",
  },
  {
    id: "mayfair-studio-w1k",
    title: "Mayfair Studio",
    address: "South Audley Street, W1K",
    price: "£2,200 pcm",
    priceNum: 2200,
    tags: ["Premium", "Bills Included"],
    stats: { beds: 1, baths: 1, sqft: 450, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    summary: "Luxurious studio apartment in the heart of Mayfair with concierge service.",
    propertyType: "flat",
    features: { parking: true, billsIncluded: true, concierge: true },
    addedDate: "2026-02-20",
    lettingType: "long_term",
  },
  {
    id: "family-detached-brookmans",
    title: "Family Detached",
    address: "Brookmans Park, AL9",
    price: "£3,500 pcm",
    priceNum: 3500,
    tags: ["Unfurnished", "Garden"],
    stats: { beds: 4, baths: 2, sqft: 2100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    summary: "Spacious family home with large garden, close to excellent schools and station.",
    propertyType: "house",
    features: { garden: true, parking: true, unfurnished: true },
    addedDate: "2026-02-26",
    lettingType: "long_term",
  },
  {
    id: "executive-apartment-hadley",
    title: "Executive Apartment",
    address: "Hadley Wood, EN4",
    price: "£2,100 pcm",
    priceNum: 2100,
    tags: ["Furnished", "Parking"],
    stats: { beds: 2, baths: 2, sqft: 950, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1577086664693-8945ed4d2d7c?auto=format&fit=crop&w=1600&q=80",
    summary: "High specification apartment with balcony, underground parking, and gym access.",
    propertyType: "flat",
    features: { parking: true, furnished: true, gym: true },
    addedDate: "2026-02-15",
    lettingType: "long_term",
  },
  {
    id: "period-cottage-potters",
    title: "Period Cottage",
    address: "Potters Bar, EN6",
    price: "£1,800 pcm",
    priceNum: 1800,
    tags: ["Character", "Parking"],
    stats: { beds: 2, baths: 1, sqft: 800, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    summary: "Charming period cottage with exposed beams, modern kitchen, and courtyard garden.",
    propertyType: "house",
    features: { parking: true, garden: true, periodFeatures: true },
    addedDate: "2026-02-18",
    lettingType: "long_term",
  },
  {
    id: "penthouse-suite-mount",
    title: "Penthouse Suite",
    address: "Mount Street, W1",
    price: "£5,500 pcm",
    priceNum: 5500,
    tags: ["Premium", "Furnished", "Concierge"],
    stats: { beds: 3, baths: 3, sqft: 1800, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    summary: "Exceptional three-bedroom penthouse with private terrace and 24-hour concierge.",
    propertyType: "flat",
    features: { parking: true, furnished: true, concierge: true, terrace: true },
    addedDate: "2026-02-22",
    lettingType: "long_term",
  },
  {
    id: "modern-apartment-cuffley",
    title: "Modern Apartment",
    address: "Cuffley, Hertfordshire",
    price: "£1,450 pcm",
    priceNum: 1450,
    tags: ["New Listing", "Unfurnished"],
    stats: { beds: 2, baths: 1, sqft: 650, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1577086664693-8945ed4d2d7c?auto=format&fit=crop&w=1600&q=80",
    summary: "Contemporary two-bedroom apartment with open-plan living and allocated parking.",
    propertyType: "flat",
    features: { parking: true, unfurnished: true },
    addedDate: "2026-02-27",
    lettingType: "long_term",
  },
  {
    id: "bungalow-brookmans",
    title: "Bungalow Retreat",
    address: "Brookmans Park, AL9",
    price: "£2,400 pcm",
    priceNum: 2400,
    tags: ["Bungalow", "Garden"],
    stats: { beds: 3, baths: 2, sqft: 1200, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    summary: "Single-storey living at its finest with wrap-around garden and off-street parking.",
    propertyType: "bungalow",
    features: { garden: true, parking: true },
    addedDate: "2026-02-24",
    lettingType: "long_term",
  },
  {
    id: "maisonette-potters",
    title: "Garden Maisonette",
    address: "Potters Bar, EN6",
    price: "£1,200 pcm",
    priceNum: 1200,
    tags: ["Maisonette", "Garden"],
    stats: { beds: 1, baths: 1, sqft: 550, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1577086664693-8945ed4d2d7c?auto=format&fit=crop&w=1600&q=80",
    summary: "Charming two-storey maisonette with private garden and modern fittings throughout.",
    propertyType: "maisonette",
    features: { garden: true },
    addedDate: "2026-02-19",
    lettingType: "long_term",
  },
  {
    id: "luxury-flat-mayfair",
    title: "Luxury One Bed Flat",
    address: "Mayfair, W1K",
    price: "£3,200 pcm",
    priceNum: 3200,
    tags: ["Premium", "Furnished", "Concierge"],
    stats: { beds: 1, baths: 1, sqft: 600, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    summary: "Elegant one-bedroom apartment in prestigious Mayfair location with porter service.",
    propertyType: "flat",
    features: { parking: true, furnished: true, concierge: true },
    addedDate: "2026-02-21",
    lettingType: "long_term",
  },
  {
    id: "student-house-enfield",
    title: "Student House Share",
    address: "Enfield, EN2",
    price: "£650 pcm",
    priceNum: 650,
    tags: ["Student", "Bills Included"],
    stats: { beds: 5, baths: 2, sqft: 1400, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    summary: "Five-bedroom house perfect for students, close to transport links and university.",
    propertyType: "house",
    features: { billsIncluded: true },
    addedDate: "2026-02-16",
    lettingType: "student",
  },
  {
    id: "short-let-mayfair",
    title: "Short-Let Apartment",
    address: "Mayfair, W1",
    price: "£4,500 pcm",
    priceNum: 4500,
    tags: ["Short Let", "Furnished", "Premium"],
    stats: { beds: 2, baths: 2, sqft: 900, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    summary: "Fully serviced short-let apartment available from 1 month to 12 months.",
    propertyType: "flat",
    features: { parking: true, furnished: true, concierge: true },
    addedDate: "2026-02-23",
    lettingType: "short_term",
  },
];

// ============================================
// Filter Logic
// ============================================

function filterProperties(properties: typeof allLettingsProperties, filters: SearchFilters) {
  return properties.filter((property) => {
    // Location filter
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      const addressMatch = property.address.toLowerCase().includes(searchTerm);
      const titleMatch = property.title.toLowerCase().includes(searchTerm);
      if (!addressMatch && !titleMatch) return false;
    }

    // Price filters (monthly rent pcm)
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

function sortProperties(properties: typeof allLettingsProperties, sortBy?: SearchFilters["sortBy"]) {
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
      // For lettings, show newest as default for reduced
      sorted.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
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

function LettingsPropertiesPageContent() {
  const { filters, setFilters, clearFilters, hasActiveFilters, isLoading } = useSearchFilters({
    debounceMs: 300,
  });
  
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  // Filter and sort properties
  const filteredProperties = React.useMemo(() => {
    const filtered = filterProperties(allLettingsProperties, filters);
    return sortProperties(filtered, filters.sortBy);
  }, [filters]);

  return (
    <div className="bg-white text-[#111827] min-h-screen">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hertfordshire-home-1.png"
            alt="Premium property to rent"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C2F33]/70 via-[#2C2F33]/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-2">To Let</p>
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
      <section className="py-12 px-6 lg:px-10">
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
                <Loader2 className="w-10 h-10 text-[#1DBFDD] animate-spin mb-4" />
                <p className="text-[#6B6E72]">Loading properties...</p>
              </motion.div>
            ) : filteredProperties.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F9FAFB] flex items-center justify-center">
                  <Home className="w-8 h-8 text-[#C8C9CB]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2C2F33] mb-2">
                  No properties found
                </h3>
                <p className="text-[#6B6E72] max-w-md mx-auto mb-6">
                  We couldn&apos;t find any rental properties matching your current filters. 
                  Try adjusting your search criteria or clearing some filters.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-[#1DBFDD] text-[#1DBFDD] hover:bg-[#1DBFDD] hover:text-white"
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
                      ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                      : viewMode === "list"
                      ? "flex flex-col gap-6"
                      : "h-[600px] bg-[#F9FAFB] rounded-2xl flex items-center justify-center"
                  }
                >
                  {viewMode === "map" ? (
                    <div className="text-center">
                      <Map className="w-12 h-12 text-[#C8C9CB] mx-auto mb-4" />
                      <p className="text-[#6B6E72]">Map view coming soon</p>
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
        <section className="border-t border-[#E5E7EB] py-8 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" className="border-[#E5E7EB]" disabled>
                Previous
              </Button>
              <Button className="bg-[#1DBFDD] text-white">1</Button>
              <Button variant="outline" className="border-[#E5E7EB]">2</Button>
              <Button variant="outline" className="border-[#E5E7EB]">3</Button>
              <Button variant="outline" className="border-[#E5E7EB]">
                Next
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Tenant Registration CTA */}
      <section className="bg-[#1DBFDD] py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mt-4 text-white/90">
            Register your requirements and we&apos;ll notify you when matching properties become available.
          </p>
          <Button className="mt-6 bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-5">
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
      <div className="bg-white text-[#111827] min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1DBFDD]" />
        </div>
        <Footer />
      </div>
    }>
      <LettingsPropertiesPageContent />
    </Suspense>
  );
}
