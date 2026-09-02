import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { buildPropertyResultsHref } from "@/lib/property-search/navigation";
import { parsePropertySearchParams } from "@/lib/property-search/query";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Property Search | Banc Property Group",
  description:
    "Search properties for sale and to rent with Banc Property Group. Filter by location, price, bedrooms and features to find your next home.",
  path: "/search",
  noindex: true,
});

// The legacy /search route rendered a mock listing set. It is quarantined:
// every visit is forwarded to the live results pages, carrying across any
// query params the canonical URL controller understands (location, price,
// bedrooms, property types, tenure, features, sort, page).
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") params.set(key, first);
  }

  // "beds" was the legacy bedroom param; the canonical controller reads
  // minBedrooms (with minBeds as a recognised alias).
  const legacyBeds = params.get("beds");
  if (legacyBeds && !params.has("minBedrooms") && !params.has("minBeds")) {
    params.set("minBedrooms", legacyBeds);
  }

  const departmentParam = params.get("department") ?? params.get("listingType");
  const department =
    departmentParam === "lettings" || departmentParam === "rent"
      ? "lettings"
      : "sales";

  let href = `/${department}/properties`;
  try {
    href = buildPropertyResultsHref(parsePropertySearchParams(params, department));
  } catch {
    // Unparseable legacy params: fall back to the bare results page.
  }

  redirect(href);
}
