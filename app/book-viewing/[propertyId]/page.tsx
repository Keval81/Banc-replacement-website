import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import BookViewingPageClient from "./BookViewingPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Book a Viewing | Banc Property Group",
  description: "Request a viewing with Banc Property Group. Choose a convenient date and time and our team will confirm your appointment.",
  path: "/book-viewing",
  noindex: true,
});

export default function BookViewingPage() {
  return <BookViewingPageClient />;
}
