import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import SoldPricesPageClient from "./SoldPricesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Sold House Prices | Cuffley & Hertfordshire | Banc Property Group",
  description: "Explore recent sold house prices in Cuffley and the surrounding Hertfordshire villages to understand what homes are really achieving.",
  path: "/sold-prices",
});

export const revalidate = 3600;

export default function SoldPricesPage() {
  return <SoldPricesPageClient />;
}
