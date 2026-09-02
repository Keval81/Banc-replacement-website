import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import MakeOfferPageClient from "./MakeOfferPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Make an Offer | Banc Property Group",
  description: "Submit an offer on a property marketed by Banc Property Group. Our sales team will acknowledge and present your offer to the vendor.",
  path: "/make-offer",
  noindex: true,
});

export default function MakeOfferPage() {
  return <MakeOfferPageClient />;
}
