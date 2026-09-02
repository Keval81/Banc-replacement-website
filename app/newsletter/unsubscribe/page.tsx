import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import NewsletterUnsubscribePageClient from "./NewsletterUnsubscribePageClient";

export const metadata: Metadata = buildMetadata({
  title: "Unsubscribe | Banc Property Group",
  description: "Unsubscribe from Banc Property Group newsletter emails.",
  path: "/newsletter/unsubscribe",
  noindex: true,
});

export default function NewsletterUnsubscribePage() {
  return <NewsletterUnsubscribePageClient />;
}
