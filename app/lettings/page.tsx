import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import LettingsPageClient from "./LettingsPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Lettings | Property to Rent & Landlord Services | Banc Property Group",
  description: "Rent a property or let your home with Banc Property Group. Lettings and property management in Cuffley, Hertfordshire and North London.",
  path: "/lettings",
});

export const revalidate = 3600;

export default function LettingsPage() {
  return <LettingsPageClient />;
}
