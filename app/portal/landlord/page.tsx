import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import LandlordPortalPageClient from "./LandlordPortalPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Landlord Portal | Banc Property Group",
  description: "Manage your let properties, tenancies and statements in the Banc Property Group landlord portal.",
  path: "/portal/landlord",
  noindex: true,
});

export default function LandlordPortalPage() {
  return <LandlordPortalPageClient />;
}
