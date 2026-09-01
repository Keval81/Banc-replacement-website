"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { SectionHeader } from "@/components/SectionHeader";

interface FeaturedItem {
  id: string;
  title: string;
  address: string;
  price: string;
  priceNum: number;
  tags: string[];
  stats: { beds: number; baths: number; sqft?: number; epc?: string };
  images: string[];
  summary: string;
}

type FeaturedState =
  | { status: "loading"; listings: [] }
  | { status: "ready"; listings: FeaturedItem[] }
  | { status: "error"; listings: [] };

export default function FeaturedListings() {
  const [state, setState] = useState<FeaturedState>({
    status: "loading",
    listings: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadFeaturedListings = async () => {
      try {
        const response = await fetch(
          "/api/properties?department=sales&status=for_sale&limit=3",
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(
            "Featured listings request failed with status " + response.status,
          );
        }

        const data = await response.json() as { properties?: FeaturedItem[] };
        if (!Array.isArray(data.properties)) {
          throw new Error(
            "Featured listings response did not contain a property list",
          );
        }

        setState({ status: "ready", listings: data.properties });
      } catch {
        if (controller.signal.aborted) return;
        setState({ status: "error", listings: [] });
      }
    };

    void loadFeaturedListings();

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
                  className="min-h-[28rem] animate-pulse rounded-sm bg-[#F4F3F1]"
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
              className="mt-5 inline-flex min-h-11 items-center border-b border-[#2C2A27] text-sm font-semibold uppercase tracking-[0.14em] text-[#2C2A27]"
            >
              Browse all properties
            </Link>
          </div>
        )}

        {state.status === "ready" && state.listings.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } },
            }}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          >
            {state.listings.map((listing) => (
              <motion.div
                key={listing.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <PropertyCard {...listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
