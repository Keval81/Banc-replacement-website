"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "@/components/SectionHeader";
import { Carousel } from "@/components/Carousel";
import { buildPropertyHref } from "@/lib/property-view";
import {
  INITIAL_FEATURED_LISTINGS_STATE,
  loadFeaturedListings,
  type FeaturedListingsState,
} from "@/lib/featured-listings";

export default function FeaturedListings() {
  const [state, setState] = useState<FeaturedListingsState>(
    INITIAL_FEATURED_LISTINGS_STATE,
  );

  useEffect(() => {
    const controller = new AbortController();

    const updateFeaturedListings = async () => {
      try {
        const nextState = await loadFeaturedListings(fetch, controller.signal);
        if (!controller.signal.aborted) setState(nextState);
      } catch (error) {
        if (
          controller.signal.aborted &&
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }
        setState({ status: "error", listings: [] });
      }
    };

    void updateFeaturedListings();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section id="featured" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <SectionHeader
          number="02"
          label="Featured"
          title="Homes on the market now"
        />

        {state.status === "loading" && (
          <div className="mt-12" role="status" aria-live="polite">
            <span className="sr-only">Loading featured homes</span>
            <div
              aria-hidden="true"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="min-h-[28rem] animate-pulse rounded-sm bg-banc-grey-pale"
                />
              ))}
            </div>
          </div>
        )}

        {state.status !== "loading" && state.listings.length === 0 && (
          <div
            className="mt-12 border border-[#DEDCD7] bg-[#F8F7F5] px-6 py-12 text-center"
            role="status"
          >
            <p className="text-lg text-[#4F4C47]">
              {state.status === "error"
                ? "We couldn't load featured homes right now."
                : "No featured homes are available right now."}
            </p>
            <Link
              href="/sales/properties"
              className="mt-5 inline-flex min-h-11 items-center border-b border-banc-dark text-sm font-semibold uppercase tracking-[0.14em] text-banc-dark"
            >
              Browse all properties
            </Link>
          </div>
        )}

        {state.status === "ready" && state.listings.length > 0 && (
          <Carousel
            label="Featured homes"
            className="mt-12"
            slideClassName="basis-[88%] sm:basis-[68%] lg:basis-[48%] xl:basis-[40%]"
          >
            {state.listings.map((listing, index) => {
              const href = buildPropertyHref(listing.department, listing.id);
              const image = listing.images[0];
              return (
                <article key={listing.id} className="banc-lift flex h-full flex-col">
                  <Link
                    href={href}
                    className="group relative block overflow-hidden rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[4/3] bg-banc-grey-pale">
                      {image && (
                        <Image
                          src={image}
                          alt={listing.title}
                          fill
                          sizes="(min-width: 1280px) 40vw, (min-width: 640px) 68vw, 88vw"
                          className="object-cover"
                          priority={index === 0}
                        />
                      )}
                      {/* A scrim, which DESIGN.md allows over photography, so the
                          price stays legible whatever the image behind it. */}
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                      <p className="absolute bottom-4 left-4 rounded-full bg-banc-dark-deep/85 px-4 py-1.5 text-base font-semibold text-white">
                        {listing.price}
                      </p>
                    </div>
                  </Link>

                  <div className="mt-5 flex flex-1 flex-col">
                    <h3 className="text-xl font-light leading-snug text-banc-dark">
                      <Link href={href} className="hover:text-banc-focus">
                        {listing.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-banc-muted-readable">
                      {listing.address}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`${href}#enquire`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-banc-focus px-6 text-sm font-medium text-white transition-colors hover:bg-banc-focus-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banc-focus focus-visible:ring-offset-2"
                      >
                        Enquire
                      </Link>
                      <Link
                        href={href}
                        className="inline-flex min-h-11 items-center border-b border-banc-dark text-sm font-semibold uppercase tracking-[0.14em] text-banc-dark transition-colors hover:text-banc-focus"
                      >
                        View home
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </Carousel>
        )}
      </div>
    </section>
  );
}
