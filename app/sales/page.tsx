import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { withPageDefaults } from "@/lib/seo";
import SalesPageClient from "./SalesPageClient";

export const metadata: Metadata = withPageDefaults("/sales", {
  title: "Property Sales | Selling Your Home with Banc",
  description: "Achieve the best price for your property with Banc Property Group. Expert valuations, premium marketing, and dedicated sales support throughout Hertfordshire and London.",
  keywords: [
    "sell property hertfordshire",
    "property sales cuffley",
    "house valuation",
    "estate agent services",
    "selling your home",
  ],
  openGraph: {
    title: "Property Sales | Selling Your Home with Banc",
    description: "Achieve the best price for your property with Banc Property Group. Expert valuations and premium marketing.",
    type: "website",
  },
});

export const revalidate = 3600;

// Structured data for sales page
const salesPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Property Sales | Banc Property Group",
  description: "Achieve the best price for your property with expert valuations and premium marketing",
  url: absoluteUrl("/sales"),
  mainEntity: {
    "@type": "Service",
    name: "Property Sales",
    provider: {
      "@type": "RealEstateAgent",
      name: "Banc Property Group",
    },
  },
};

export default function SalesPage() {
  return (
    <>
      <JsonLd data={salesPageStructuredData} />
      <SalesPageClient />
    </>
  );
}
