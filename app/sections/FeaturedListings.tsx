"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import { SectionHeader } from "@/components/SectionHeader";

// Featured = the three highest-priced live for-sale listings from the
// Expert Agent feed (via /api/properties). No mock fallback: until data
// arrives (or if the API is down) the section renders nothing rather than
// showing invented homes.
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

export default function FeaturedListings() {
  const [listings, setListings] = useState<FeaturedItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/properties?department=sales&status=for_sale&limit=3")
      .then((r) => (r.ok ? r.json() : { properties: [] }))
      .then((d) => {
        if (!cancelled) setListings(d.properties ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (listings.length === 0) return null;

  return (
    <section id="featured" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-20 lg:py-28 lg:px-10">
        <SectionHeader number="02" label="Featured" title="Homes on the market now" />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {listings.map((listing) => (
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
      </div>
    </section>
  );
}
