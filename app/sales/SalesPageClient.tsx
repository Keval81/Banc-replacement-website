"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageBand } from "@/components/PageBand";
import {
  actionPrimaryOnDark,
  actionSecondaryOnDark,
  eyebrow,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
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

const serviceCard =
  "block rounded-[var(--radius-md)] border border-banc-line bg-white p-5 transition-colors duration-200 hover:border-banc-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2 lg:p-6";

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

      <PageBand
        eyebrow="Property Sales"
        title="Selling Your Property"
        lede="Achieve the best price for your home with our premium marketing, expert valuations, and dedicated sales team."
        image={{
          src: "https://images.unsplash.com/photo-1732983989209-ae2fa3d1a9fc?auto=format&fit=crop&w=1920&q=80",
          alt: "",
          priority: true,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/valuation" className={actionPrimaryOnDark}>
            Request Valuation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/sales/properties" className={actionSecondaryOnDark}>
            View Properties
          </Link>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6">
          <PropertySearchBarView
            department="sales"
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
        </div>
      </PageBand>

      {/* Services */}
      <section className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <Link href="/sales/properties" className={serviceCard}>
              <Home className="h-6 w-6 text-banc-focus" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Our Properties</h3>
              <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                Browse our portfolio of premium properties for sale.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-banc-focus">
                View Properties <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/sales/buyers-guide" className={serviceCard}>
              <Users className="h-6 w-6 text-banc-focus" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Buyers Guide</h3>
              <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                Everything you need to know about buying a property.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-banc-focus">
                Read Guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/sales/sellers-guide" className={serviceCard}>
              <FileText className="h-6 w-6 text-banc-focus" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Sellers Guide</h3>
              <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                Expert advice on preparing and selling your home.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-banc-focus">
                Read Guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/tools/stamp-duty" className={serviceCard}>
              <Calculator className="h-6 w-6 text-banc-focus" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Stamp Duty</h3>
              <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                Work out the stamp duty on your next purchase.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-banc-focus">
                Calculate <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/area-guides" className={cn(serviceCard, "sm:col-span-2 lg:col-span-1")}>
              <MapPin className="h-6 w-6 text-banc-focus" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-banc-dark-deep">Area Guides</h3>
              <p className="mt-1 text-sm leading-relaxed text-banc-muted-readable">
                Learn more about the local areas where we operate.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-banc-focus">
                Explore Areas <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Why Banc</p>
          <h2 className={cn(sectionHeading, "mt-3")}>The Banc Sales Advantage</h2>

          <div className="mt-7 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Local Expertise", desc: "Deep knowledge of Cuffley, Mayfair and surrounding areas" },
              { title: "Premium Marketing", desc: "Professional photography, video tours, and targeted advertising" },
              { title: "Qualified Buyers", desc: "Access to our database of pre-qualified, serious buyers" },
              { title: "Dedicated Support", desc: "Personal agent from valuation through to completion" },
            ].map((item) => (
              <div key={item.title} className="border-t border-banc-dark/15 py-5">
                <h3 className="text-base font-semibold text-banc-dark-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-banc-muted-readable">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
        <div className="mx-auto max-w-7xl">
          <h2 className={sectionHeadingOnDark}>Ready to sell your property?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            Get a free, no-obligation valuation from our expert team.
          </p>
          <Link href="/valuation" className={cn(actionPrimaryOnDark, "mt-7")}>
            Book Your Valuation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
