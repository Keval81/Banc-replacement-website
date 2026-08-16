"use client";

import * as React from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import {
  PropertyContactPanel,
  PropertyMobileActions,
} from "@/components/property-detail/PropertyContactActions";
import { PropertyHeroGallery } from "@/components/property-detail/PropertyHeroGallery";
import { PropertyMediaTabs } from "@/components/property-detail/PropertyMediaTabs";
import { PropertyOverview } from "@/components/property-detail/PropertyOverview";
import { PropertySummary } from "@/components/property-detail/PropertySummary";
import { Button } from "@/components/ui/button";
import type { LivePropertyDetail, PropertyCardData } from "@/lib/property-view";

type LoadState =
  | { phase: "loading" }
  | { phase: "notfound" }
  | { phase: "ready"; property: LivePropertyDetail; similar: PropertyCardData[] };

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.ReactElement {
  const { id } = React.use(params);
  const pathname = usePathname();
  const requestedDepartment = pathname.startsWith("/lettings/") ? "lettings" : "sales";
  const resultsHref = `/${requestedDepartment}/properties`;
  const [state, setState] = React.useState<LoadState>({ phase: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/properties/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.property) setState({ phase: "notfound" });
        else {
          setState({
            phase: "ready",
            property: data.property,
            similar: data.similar ?? [],
          });
          document.title = `${data.property.title} | Banc Property Group`;
        }
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "notfound" });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {state.phase === "loading" && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-banc-sky motion-reduce:animate-none" />
          <p className="text-banc-grey">Loading property…</p>
        </div>
      )}

      {state.phase === "notfound" && (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-3 text-2xl font-semibold text-banc-dark">
            This property is no longer available
          </h1>
          <p className="mb-6 text-banc-grey">
            It may have been{" "}
            {requestedDepartment === "lettings" ? "let or withdrawn" : "sold or withdrawn"}.
            Our current listings are updated directly from our property system.
          </p>
          <Link href={resultsHref}>
            <Button className="bg-banc-sky text-white hover:bg-banc-sky-dark">
              View current properties
            </Button>
          </Link>
        </div>
      )}

      {state.phase === "ready" && (
        <DetailBody property={state.property} similar={state.similar} />
      )}

      <Footer />
    </div>
  );
}

function DetailBody({
  property,
  similar,
}: {
  property: LivePropertyDetail;
  similar: PropertyCardData[];
}): React.ReactElement {
  return (
    <>
      <PropertyBreadcrumb property={property} />
      <main className="pb-32 lg:pb-16">
        <div className="mx-auto max-w-[1440px] lg:px-6 xl:px-8">
          <PropertyHeroGallery images={property.gallery} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertySummary property={property} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0 space-y-12">
              <PropertyOverview property={property} />
              <PropertyMediaTabs property={property} />
            </div>
            <PropertyContactPanel property={property} />
          </div>

          {similar.length > 0 && (
            <section
              className="mt-16 border-t border-banc-grey/15 pt-12"
              aria-labelledby="similar-properties-heading"
            >
              <h2 id="similar-properties-heading" className="font-serif text-3xl text-banc-dark">
                Similar homes
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.slice(0, 3).map((item) => (
                  <PropertyCard key={item.id} {...item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <PropertyMobileActions property={property} />
    </>
  );
}

function PropertyBreadcrumb({
  property,
}: {
  property: LivePropertyDetail;
}): React.ReactElement {
  const resultsHref = `/${property.department}/properties`;
  const resultsLabel = property.department === "lettings" ? "To Let" : "For Sale";

  return (
    <div className="border-b border-banc-grey/20 bg-banc-grey-pale">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 overflow-hidden text-sm text-banc-grey"
        >
          <Link
            href="/"
            className="shrink-0 rounded-sm transition-colors hover:text-banc-sky focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-dark"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <Link
            href={resultsHref}
            className="shrink-0 rounded-sm transition-colors hover:text-banc-sky focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-banc-dark"
          >
            {resultsLabel}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="min-w-0 truncate text-banc-dark">
            {property.address}
          </span>
        </nav>
      </div>
    </div>
  );
}
