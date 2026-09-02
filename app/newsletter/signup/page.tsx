import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import NewsletterSignupPageClient from "./NewsletterSignupPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter Signup | Banc Property Group",
  description: "Subscribe to Banc Property Group's newsletter for new listings, local market updates and property advice for Cuffley and Hertfordshire.",
  path: "/newsletter/signup",
});

export const revalidate = 3600;

export default function NewsletterSignupPage() {
  return <NewsletterSignupPageClient />;
}
