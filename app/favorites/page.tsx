import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import FavoritesPageClient from "./FavoritesPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Saved Properties | Banc Property Group",
  description: "Your saved properties from Banc Property Group. Revisit the homes you have shortlisted and book viewings.",
  path: "/favorites",
  noindex: true,
});

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
