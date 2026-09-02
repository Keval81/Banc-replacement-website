import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import SalesPropertiesPageClient from "./SalesPropertiesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Properties for Sale | Cuffley & Hertfordshire | Banc Property Group",
  description: "Browse homes for sale in Cuffley, Goffs Oak, Potters Bar and across Hertfordshire with Banc Property Group. Live listings updated daily.",
  path: "/sales/properties",
});

export const revalidate = 3600;

export default function SalesPropertiesPage() {
  return <SalesPropertiesPageClient />;
}
