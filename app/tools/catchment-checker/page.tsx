import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import CatchmentCheckerPageClient from "./CatchmentCheckerPageClient";

export const metadata: Metadata = buildMetadata({
  title: "School Catchment Checker | Banc Property Group",
  description: "Check which schools are near a property in Cuffley and Hertfordshire with Banc Property Group's free school catchment checker.",
  path: "/tools/catchment-checker",
});

export const revalidate = 3600;

export default function CatchmentCheckerPage() {
  return <CatchmentCheckerPageClient />;
}
