import type { Metadata } from "next";
import { Suspense } from "react";

import { buildMetadata } from "@/lib/seo";

import SearchContent from "./SearchContent";

export const metadata: Metadata = buildMetadata({
  title: "Property Search | Banc Property Group",
  description:
    "Search properties for sale and to rent with Banc Property Group. Filter by location, price, bedrooms and features to find your next home.",
  path: "/search",
  noindex: true,
});

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#1A1917] via-[#1a1d21] to-[#0f1113] flex items-center justify-center">
          <div className="text-white/60">Loading search...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
