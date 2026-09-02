import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import ValuationPageClient from "./ValuationPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Free Property Valuation | Cuffley Estate Agents | Banc Property Group",
  description: "Book a free, no-obligation property valuation with Banc Property Group. Director-led advice on what your home is worth in Cuffley and Hertfordshire.",
  path: "/valuation",
});

export const revalidate = 3600;

export default function ValuationPage() {
  return <ValuationPageClient />;
}
