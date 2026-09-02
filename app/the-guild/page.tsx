import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import TheGuildPageClient from "./TheGuildPageClient";

export const metadata: Metadata = buildMetadata({
  title: "The Guild of Property Professionals | Banc Property Group",
  description: "Banc Property Group is a member of The Guild of Property Professionals, a national network of independent estate agents with a Park Lane, Mayfair associate office.",
  path: "/the-guild",
});

export const revalidate = 3600;

export default function TheGuildPage() {
  return <TheGuildPageClient />;
}
