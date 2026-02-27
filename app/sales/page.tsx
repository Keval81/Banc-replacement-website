import type { Metadata } from "next";
import SalesPageClient from "./SalesPageClient";

export const metadata: Metadata = {
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
    url: "https://bancproperty.com/sales",
  },
  alternates: {
    canonical: "https://bancproperty.com/sales",
  },
};

// Structured data for sales page
const salesPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Property Sales | Banc Property Group",
  description: "Achieve the best price for your property with expert valuations and premium marketing",
  url: "https://bancproperty.com/sales",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(salesPageStructuredData),
        }}
      />
      <SalesPageClient />
    </>
  );
}
