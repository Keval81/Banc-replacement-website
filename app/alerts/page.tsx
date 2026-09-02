import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import AlertsPageClient from "./AlertsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Property Alerts | Banc Property Group",
  description: "Set up property alerts and be the first to hear about new homes for sale and to let in Cuffley, Hertfordshire and North London.",
  path: "/alerts",
  noindex: true,
});

export default function AlertsPage() {
  return <AlertsPageClient />;
}
