import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import VendorPortalPageClient from "./VendorPortalPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Vendor Portal | Banc Property Group",
  description: "Track viewings, feedback and offers on your sale in the Banc Property Group vendor portal.",
  path: "/portal/vendor",
  noindex: true,
});

export default function VendorPortalPage() {
  return <VendorPortalPageClient />;
}
