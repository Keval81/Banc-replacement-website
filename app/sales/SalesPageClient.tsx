"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, FileText, Calculator, MapPin } from "lucide-react";
import Link from "next/link";
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

export default function SalesPageClient() {
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
    setQuery(createDefaultPropertySearchQuery("sales"));
  }, []);

  const handleSearch = React.useCallback(() => {
    router.push(buildPropertyResultsHref(query));
  }, [query, router]);

  return (
    <div className="bg-white text-banc-dark">
      <Header />
      
      {/* Hero - Mobile Optimized */}
      <section className="relative bg-banc-dark-deep py-12 lg:py-24">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1732983989209-ae2fa3d1a9fc?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-banc-sky lg:mb-3 lg:text-sm">Property Sales</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-5xl">
              Selling Your Property
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70 lg:mt-4 lg:text-lg">
              Achieve the best price for your home with our premium marketing, 
              expert valuations, and dedicated sales team.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 lg:mt-6">
              <Link href="/valuation">
                <Button className="bg-banc-sky px-5 py-5 text-sm text-white hover:bg-banc-sky-dark active:bg-banc-sky-dark lg:px-6 lg:py-6 lg:text-base">
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
          <PropertySearchBarView
            department="sales"
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onSearch={handleSearch}
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
              <div className="rounded-2xl border border-banc-line p-5 transition-all active:bg-banc-grey-pale lg:p-8 lg:hover:border-banc-sky lg:hover:shadow-lg">
                <Home className="h-7 w-7 text-banc-sky lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Our Properties</h3>
                <p className="mt-1 text-sm text-banc-grey lg:mt-2">
                  Browse our portfolio of premium properties for sale.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-banc-sky lg:mt-4">
                  View Properties <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/sales/buyers-guide" className="group">
              <div className="rounded-2xl border border-banc-line p-5 transition-all active:bg-banc-grey-pale lg:p-8 lg:hover:border-banc-sky lg:hover:shadow-lg">
                <Users className="h-7 w-7 text-banc-sky lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Buyers Guide</h3>
                <p className="mt-1 text-sm text-banc-grey lg:mt-2">
                  Everything you need to know about buying a property.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-banc-sky lg:mt-4">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/sales/sellers-guide" className="group">
              <div className="rounded-2xl border border-banc-line p-5 transition-all active:bg-banc-grey-pale lg:p-8 lg:hover:border-banc-sky lg:hover:shadow-lg">
                <FileText className="h-7 w-7 text-banc-sky lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Sellers Guide</h3>
                <p className="mt-1 text-sm text-banc-grey lg:mt-2">
                  Expert advice on preparing and selling your home.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-banc-sky lg:mt-4">
                  Read Guide <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/tools/stamp-duty" className="group">
              <div className="rounded-2xl border border-banc-line p-5 transition-all active:bg-banc-grey-pale lg:p-8 lg:hover:border-banc-sky lg:hover:shadow-lg">
                <Calculator className="h-7 w-7 text-banc-sky lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Stamp Duty</h3>
                <p className="mt-1 text-sm text-banc-grey lg:mt-2">
                  Work out the stamp duty on your next purchase.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-banc-sky lg:mt-4">
                  Calculate <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link href="/area-guides" className="group sm:col-span-2 lg:col-span-1">
              <div className="rounded-2xl border border-banc-line p-5 transition-all active:bg-banc-grey-pale lg:p-8 lg:hover:border-banc-sky lg:hover:shadow-lg">
                <MapPin className="h-7 w-7 text-banc-sky lg:h-10 lg:w-10" />
                <h3 className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">Area Guides</h3>
                <p className="mt-1 text-sm text-banc-grey lg:mt-2">
                  Learn more about the local areas where we operate.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-banc-sky lg:mt-4">
                  Explore Areas <ArrowRight className="ml-1 h-4 w-4 transition-transform group-active:translate-x-1 lg:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-banc-grey-pale py-10 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="mb-6 text-center lg:mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-banc-sky lg:text-sm">Why Banc</p>
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
                <p className="mt-1 text-xs text-banc-grey lg:mt-2 lg:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-banc-sky py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-10">
          <h2 className="text-xl font-semibold text-white lg:text-4xl">
            Ready to sell your property?
          </h2>
          <p className="mt-2 text-sm text-white/90 lg:mt-3 lg:text-lg">
            Get a free, no-obligation valuation from our expert team.
          </p>
          <Link href="/contact">
            <Button className="mt-5 bg-white px-6 py-5 text-sm text-banc-sky hover:bg-white/90 active:bg-white/90 lg:mt-6 lg:px-8 lg:py-6 lg:text-base">
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
