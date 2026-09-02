import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = buildMetadata({
  title: "Compare Properties | Banc Property Group",
  description: "Compare properties side by side — price, bedrooms, size and features — to help you decide on your next home.",
  path: "/compare",
  noindex: true,
});

export default function ComparePage() {
  return <ComparePageClient />;
}
