"use client";

import * as React from "react";

import PropertyCard from "@/components/PropertyCard";
import type { PropertyCardData } from "@/lib/property-view";

/**
 * Banc has far more let stock than available stock, so a lettings page can
 * look empty when only a couple of homes are on the market. This shows what
 * has recently gone, which is the more honest signal of how busy the desk is.
 */
export function RecentlyLetStrip(): React.ReactElement | null {
  const [properties, setProperties] = React.useState<PropertyCardData[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void fetch("/api/properties/recently-let")
      .then((response) => (response.ok ? response.json() : { properties: [] }))
      .then((body: { properties?: PropertyCardData[] }) => {
        if (!cancelled) setProperties(body.properties ?? []);
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (properties.length === 0) return null;

  return (
    <section className="border-t border-banc-line bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-banc-sky">
          Recently let
        </p>
        <h2 className="font-display text-2xl font-light leading-[1.1] tracking-[-0.02em] text-banc-dark-deep sm:text-3xl lg:text-4xl">
          Homes we have let in the area
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-banc-muted-readable">
          These are already let, so they are not available to view. They show
          the kind of home we handle and what it achieved. Tell us what you are
          looking for and we will call you when the next one comes up.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <span className="absolute left-4 top-4 z-10 rounded-full bg-banc-dark-deep/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white">
                Let agreed
              </span>
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
