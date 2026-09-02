import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import ProgressPageClient from "./ProgressPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Sales Progress Tracker | Banc Property Group",
  description: "Follow every stage of your sale or purchase with Banc Property Group's transaction progress tracker.",
  path: "/progress",
  noindex: true,
});

export default function ProgressPage() {
  return <ProgressPageClient />;
}
