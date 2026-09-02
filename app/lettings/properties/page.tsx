import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import LettingsPropertiesPageClient from "./LettingsPropertiesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Properties to Rent | Cuffley & Hertfordshire | Banc Property Group",
  description: "Browse homes to rent in Cuffley, Potters Bar, Cheshunt and across Hertfordshire with Banc Property Group. Live listings updated daily.",
  path: "/lettings/properties",
});

export const revalidate = 3600;

export default function LettingsPropertiesPage() {
  return <LettingsPropertiesPageClient />;
}
