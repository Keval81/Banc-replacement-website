"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, FileText } from "lucide-react";
import Link from "next/link";

// New professional search components
import {
  PropertySearchBar,
  type SearchFilters,
} from "@/components/property";

export default function SalesPageClient() {
  const router = useRouter();

  // Local state for filters (not URL-synced on sales page)
  const [filters, setFilters] = React.useState<SearchFilters>({});

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.location !== undefined ||
      filters.radius !== undefined ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.minBeds !== undefined ||
      filters.maxBeds !== undefined ||
      filters.minBaths !== undefined ||
      filters.maxBaths !== undefined ||
      (filters.propertyType?.length ?? 0) > 0 ||
      (filters.tenure?.length ?? 0) > 0 ||
      Object.values(filters.features || {}).some(Boolean)
    );
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = React.useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev };

      // Handle special case for features (merge instead of replace)
      if (newFilters.features) {
        updated.features = { ...prev.features, ...newFilters.features };
      }

      // Apply all other filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (key !== "features") {
          if (value === undefined) {
            delete (updated as Record<string, unknown>)[key];
          } else {
            (updated as Record<string, unknown>)[key] = value;
          }
        }
      });

      return updated;
    });
  }, []);

  // Clear all filters
  const handleClearFilters = React.useCallback(() => {
    setFilters({});
  }, []);

  // Build query params and navigate to properties page
  const buildQueryString = (currentFilters: SearchFilters): string => {
    const params = new URLSearchParams();

    // Location
    if (currentFilters.location) params.set("location", currentFilters.location);

    // Radius
    if (currentFilters.radius !== undefined) params.set("radius", currentFilters.radius.toString());

    // Price
    if (currentFilters.minPrice !== undefined) params.set("minPrice", currentFilters.minPrice.toString());
    if (currentFilters.maxPrice !== undefined) params.set("maxPrice", currentFilters.maxPrice.toString());

    // Bedrooms
    if (currentFilters.minBeds !== undefined) params.set("minBeds", currentFilters.minBeds.toString());
    if (currentFilters.maxBeds !== undefined) params.set("maxBeds", currentFilters.maxBeds.toString());

    // Bathrooms
    if (currentFilters.minBaths !== undefined) params.set("minBaths", currentFilters.minBaths.toString());
    if (currentFilters.maxBaths !== undefined) params.set("maxBaths", currentFilters.maxBaths.toString());

    // Property Type
    if (currentFilters.propertyType?.length) {
      params.set("propertyType", currentFilters.propertyType.join(","));
    }

    // Tenure
    if (currentFilters.tenure?.length) {
      params.set("tenure", currentFilters.tenure.join(","));
    }

    // Features
    if (currentFilters.features) {
      Object.entries(currentFilters.features).forEach(([key, value]) => {
        if (value) params.set(key, "true");
      });
    }

    // Sort
    if (currentFilters.sortBy) params.set("sortBy", currentFilters.sortBy);

    return params.toString();
  };

  // Handle search - navigate to properties page
  const handleFilterChangeWithSearch = React.useCallback((newFilters: Partial<SearchFilters>) => {
    handleFilterChange(newFilters);
    
    // If location is being set (search submitted), navigate to properties page
    if (newFilters.location !== undefined) {
      const updatedFilters = { ...filters, ...newFilters };
      const queryString = buildQueryString(updatedFilters);
      router.push(`/sales/properties${queryString ? `?${queryString}` : ""}`);
    }
  }, [filters, handleFilterChange, router]);

  return (
    <div className="bg-white text-[#2C2A27]">
      <Header />
      
      {/* Hero - Mobile Optimized */}
      <section className="relative bg-[#1A1917] py-12 lg:py-24">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1917]/80 via-[#1A1917]/60 to-[#1A1917]/40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#4AC8E8] lg:mb-3 lg:text-sm">Property Sales</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-5xl">
              Selling Your Property
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70 lg:mt-4 lg:text-lg">
              Achieve the best price for your home with our premium marketing, 
              expert valuations, and dedicated sales team.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 lg:mt-6">
              <Link href="/contact">
                <Button className="bg-[#4AC8E8] px-5 py-5 text-sm text-white hover:bg-[#1A9BBF] active:bg-[#1A9BBF] lg:px-6 lg:py-6 lg:text-base">
                  Request Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sales/properties">
                <Button variant="outline" className="border-white/30 px-5 py-5 text-sm text-white hover:bg-white/10 active:bg-white/10 lg:px-6 lg:py-6 lg:text-base">
                  View Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Search Section - Using New Professional Component */}
      <section className="relative z-10 -mt-8 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <PropertySearchBar
            department="sales"
            filters={filters}
            onFilterChange={handleFilterChangeWithSearch}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            isLoading={false}
            showMapButton={false}
          />
        </div>
      </section>

      {/* Services Grid - Mobile Optimized */}
      <section className="py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <Link href="/sales/properties" className="group">
              <div className="rounded-2xl border border-[#E0DFDC] p-5 transition-all active:bg-[#F4F3F1] lg:p-8 lg:hover:border-[#4AC8E8] lg:hover:shadow-lg">
                <Home className="h-7 w-7 text-[#4AC8E8] lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Our Properties</h3>
                <p className="mt-1 text-sm text-[#8A8880] lg:mt-2">
                  Browse our portfolio of premium properties for sale.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[#4AC8E8] lg:mt-4">
                  View Properties <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/sales/buyers-guide" className="group">
              <div className="rounded-2xl border border-[#E0DFDC] p-5 transition-all active:bg-[#F4F3F1] lg:p-8 lg:hover:border-[#4AC8E8] lg:hover:shadow-lg">
                <Users className="h-7 w-7 text-[#4AC8E8] lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Buyers Guide</h3>
                <p className="mt-1 text-sm text-[#8A8880] lg:mt-2">
                  Everything you need to know about buying a property.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[#4AC8E8] lg:mt-4">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/sales/sellers-guide" className="group sm:col-span-2 lg:col-span-1">
              <div className="rounded-2xl border border-[#E0DFDC] p-5 transition-all active:bg-[#F4F3F1] lg:p-8 lg:hover:border-[#4AC8E8] lg:hover:shadow-lg">
                <FileText className="h-7 w-7 text-[#4AC8E8] lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Sellers Guide</h3>
                <p className="mt-1 text-sm text-[#8A8880] lg:mt-2">
                  Expert advice on preparing and selling your home.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[#4AC8E8] lg:mt-4">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#F4F3F1] py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="mb-6 text-center lg:mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4AC8E8] lg:text-sm">Why Banc</p>
            <h2 className="mt-2 text-xl font-semibold lg:mt-3 lg:text-4xl">The Banc Sales Advantage</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { title: "Local Expertise", desc: "Deep knowledge of Cuffley, Mayfair and surrounding areas" },
              { title: "Premium Marketing", desc: "Professional photography, video tours, and targeted advertising" },
              { title: "Qualified Buyers", desc: "Access to our database of pre-qualified, serious buyers" },
              { title: "Dedicated Support", desc: "Personal agent from valuation through to completion" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white p-4 text-center lg:p-6">
                <h3 className="text-sm font-semibold lg:text-base">{item.title}</h3>
                <p className="mt-1 text-xs text-[#8A8880] lg:mt-2 lg:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#4AC8E8] py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-10">
          <h2 className="text-xl font-semibold text-white lg:text-4xl">
            Ready to sell your property?
          </h2>
          <p className="mt-2 text-sm text-white/90 lg:mt-3 lg:text-lg">
            Get a free, no-obligation valuation from our expert team.
          </p>
          <Link href="/contact">
            <Button className="mt-5 bg-white px-6 py-5 text-sm text-[#4AC8E8] hover:bg-white/90 active:bg-white/90 lg:mt-6 lg:px-8 lg:py-6 lg:text-base">
              Book Your Valuation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
