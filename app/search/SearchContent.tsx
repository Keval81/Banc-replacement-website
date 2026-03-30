"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyMap from "@/components/search/PropertyMap";
import CompareBar from "@/components/search/CompareBar";
import MobileSearchDrawer from "@/components/search/MobileSearchDrawer";
import { useSearchParams } from "@/app/hooks/useSearchParams";
import { useComparison } from "@/app/hooks/usePropertyComparison";
import { Button } from "@/components/ui/button";
import { 
  Grid3X3, 
  List, 
  Map, 
  SlidersHorizontal, 
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

// Extended property data with additional fields
const properties = [
  {
    id: "the-laurels-hadley-wood",
    title: "The Laurels",
    address: "Hadley Wood, EN4",
    price: "£2,450,000",
    priceValue: 2450000,
    tags: ["New Listing", "Premium", "Video Tour"],
    stats: { beds: 5, baths: 4, sqft: 3820, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Elegant modern residence with landscaped gardens and seamless indoor-outdoor living.",
    type: "house",
    tenure: "freehold",
    dateAdded: "2026-02-25",
    coordinates: { lat: 51.663, lng: -0.17 },
  },
  {
    id: "mayfair-penthouse-mount-street",
    title: "Mayfair Penthouse",
    address: "Mount Street, W1",
    price: "£3,900,000",
    priceValue: 3900000,
    tags: ["Premium", "Video Tour"],
    stats: { beds: 3, baths: 3, sqft: 2100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Light-filled penthouse with panoramic views, concierge service, and private terrace.",
    type: "penthouse",
    tenure: "leasehold",
    dateAdded: "2026-02-20",
    coordinates: { lat: 51.5074, lng: -0.1278 },
  },
  {
    id: "cuffley-house-hertfordshire",
    title: "Cuffley House",
    address: "Cuffley, Hertfordshire",
    price: "£1,350,000",
    priceValue: 1350000,
    tags: ["New Listing", "Premium"],
    stats: { beds: 4, baths: 3, sqft: 2600, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Characterful family home with open-plan living, media room, and expansive gardens.",
    type: "house",
    tenure: "freehold",
    dateAdded: "2026-02-26",
    coordinates: { lat: 51.68, lng: -0.1 },
  },
  {
    id: "woodland-manor-brookmans-park",
    title: "Woodland Manor",
    address: "Brookmans Park, AL9",
    price: "£1,850,000",
    priceValue: 1850000,
    tags: ["Premium", "Gardens"],
    stats: { beds: 5, baths: 4, sqft: 3200, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Stunning detached residence set within mature grounds with woodland views and triple garage.",
    type: "mansion",
    tenure: "freehold",
    dateAdded: "2026-02-15",
    coordinates: { lat: 51.72, lng: -0.2 },
  },
  {
    id: "the-old-rectory-potters-bar",
    title: "The Old Rectory",
    address: "Potters Bar, EN6",
    price: "£2,100,000",
    priceValue: 2100000,
    tags: ["Period Property", "Grade II"],
    stats: { beds: 6, baths: 3, sqft: 4100, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Impressive Grade II listed former rectory with period features, modernised throughout.",
    type: "house",
    tenure: "freehold",
    dateAdded: "2026-02-10",
    coordinates: { lat: 51.69, lng: -0.18 },
  },
  {
    id: "parkside-apartment-mayfair",
    title: "Parkside Apartment",
    address: "Mayfair, W1K",
    price: "£1,650,000",
    priceValue: 1650000,
    tags: ["Apartment", "Park View"],
    stats: { beds: 2, baths: 2, sqft: 1100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Elegant two-bedroom apartment overlooking Hyde Park with concierge and underground parking.",
    type: "apartment",
    tenure: "leasehold",
    dateAdded: "2026-02-22",
    coordinates: { lat: 51.507, lng: -0.15 },
  },
  {
    id: "rose-cottage-chorleywood",
    title: "Rose Cottage",
    address: "Chorleywood, WD3",
    price: "£975,000",
    priceValue: 975000,
    tags: ["Cottage", "Character"],
    stats: { beds: 3, baths: 2, sqft: 1450, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1600596542815-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Charming period cottage with inglenook fireplace, mature garden, and rural views.",
    type: "cottage",
    tenure: "freehold",
    dateAdded: "2026-02-24",
    coordinates: { lat: 51.66, lng: -0.52 },
  },
  {
    id: "riverside-barn-broxbourne",
    title: "Riverside Barn",
    address: "Broxbourne, EN10",
    price: "£1,125,000",
    priceValue: 1125000,
    tags: ["Barn Conversion", "Waterfront"],
    stats: { beds: 4, baths: 2, sqft: 2100, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Stunning barn conversion with river frontage, vaulted ceilings, and contemporary design.",
    type: "barn",
    tenure: "freehold",
    dateAdded: "2026-02-18",
    coordinates: { lat: 51.74, lng: -0.02 },
  },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "beds", label: "Bedrooms" },
];

export default function SearchPage() {
  const { filters, updateFilters, clearFilters, hasActiveFilters } = useSearchParams();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore, comparedProperties } = useComparison();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Apply filters
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.priceValue >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.priceValue <= filters.maxPrice!);
    }
    if (filters.beds !== undefined) {
      result = result.filter((p) => p.stats.beds >= filters.beds!);
    }
    if (filters.propertyType?.length) {
      result = result.filter((p) => filters.propertyType!.includes(p.type));
    }
    if (filters.tenure) {
      result = result.filter((p) => p.tenure === filters.tenure);
    }
    if (filters.keywords) {
      const keyword = filters.keywords.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(keyword) ||
          p.summary.toLowerCase().includes(keyword) ||
          p.tags.some((t) => t.toLowerCase().includes(keyword))
      );
    }
    if (filters.addedSince) {
      const cutoff = new Date();
      const days = filters.addedSince === "24h" ? 1 : filters.addedSince === "3d" ? 3 : filters.addedSince === "7d" ? 7 : 30;
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((p) => new Date(p.dateAdded) >= cutoff);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "price-desc":
        result.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "beds":
        result.sort((a, b) => b.stats.beds - a.stats.beds);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }

    return result;
  }, [filters]);

  const handleCompareToggle = (property: any) => {
    if (isInComparison(property.id)) {
      removeFromComparison(property.id);
    } else {
      addToComparison(property);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.beds !== undefined) count++;
    if (filters.propertyType?.length) count++;
    if (filters.tenure) count++;
    if (filters.keywords) count++;
    if (filters.addedSince) count++;
    if (filters.includeArchived) count++;
    return count;
  }, [filters]);

  return (
    <div className="bg-white text-[#2C2A27]">
      <Header />
      
      {/* Hero Search Bar */}
      <section className="bg-[#1A1917] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, property name..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#4AC8E8]"
              />
            </div>
            <Link href="/alerts">
              <Button className="bg-[#4AC8E8] hover:bg-[#1A9BBF]">
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Results Bar */}
      <section className="border-b border-[#E0DFDC] bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#4AC8E8] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Result Count */}
            <p className="hidden md:block text-sm text-gray-600">
              <span className="font-semibold">{filteredProperties.length}</span> properties found
            </p>

            {/* Sort & View */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="min-h-[40px] appearance-none bg-white border border-gray-200 rounded-lg px-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AC8E8]/20 focus:border-[#4AC8E8] cursor-pointer transition-colors hover:border-[#4AC8E8]/50"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => updateFilters({ view: "grid" })}
                  className={`p-2 rounded ${filters.view === "grid" ? "bg-white shadow-sm" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateFilters({ view: "list" })}
                  className={`p-2 rounded ${filters.view === "list" ? "bg-white shadow-sm" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateFilters({ view: "map" })}
                  className={`p-2 rounded ${filters.view === "map" ? "bg-white shadow-sm" : ""}`}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden md:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl border border-[#E0DFDC] overflow-hidden">
                <SearchFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {filters.view === "map" ? (
                <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden">
                  <PropertyMap 
                    properties={filteredProperties.map(p => ({ ...p, coordinates: p.coordinates || { lat: 51.5074, lng: -0.1278 } }))} 
                  />
                </div>
              ) : (
                <motion.div
                  layout
                  className={`grid gap-4 sm:gap-6 ${
                    filters.view === "list"
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {filteredProperties.map((property) => (
                    <motion.div
                      key={property.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <PropertyCard
                        {...property}
                        showCompare
                        isCompared={isInComparison(property.id)}
                        canCompare={canAddMore}
                        onCompareToggle={() => handleCompareToggle(property)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {filteredProperties.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No properties match your filters</p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Compare Bar */}
      <CompareBar />

      {/* Mobile Filters */}
      <MobileSearchDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
