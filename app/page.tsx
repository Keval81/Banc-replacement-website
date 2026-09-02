import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd } from "@/lib/schema-org";
import { absoluteUrl } from "@/lib/site";
import { withPageDefaults } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/app/sections/Hero";
import PropertySearch from "@/app/sections/PropertySearch";
import FeaturedListings from "@/app/sections/FeaturedListings";
import Services from "@/app/sections/Services";
import Testimonials from "@/app/sections/Testimonials";
// GoogleReviews removed — covered by Testimonials section
// Partner logos moved to Footer

export const metadata: Metadata = withPageDefaults("/", {
  title: "Banc Property Group | Independent Estate Agents",
  description: "Exceptional properties and bespoke estate agency services in Cuffley and Hertfordshire. Director-led team, premium marketing, and expert valuations. Your property journey starts here.",
  keywords: [
    "estate agents cuffley",
    "property for sale hertfordshire",
    "property valuations",
    "banc property group",
  ],
  openGraph: {
    title: "Banc Property Group | Independent Estate Agents",
    description: "Exceptional properties and bespoke estate agency services in Cuffley and Hertfordshire.",
    type: "website",
    images: [
      {
        url: absoluteUrl("/api/og"),
        width: 1200,
        height: 630,
        alt: "Banc Property Group - Premium Estate Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Banc Property Group | Independent Estate Agents",
    description: "Exceptional properties and bespoke estate agency services in Cuffley and Hertfordshire.",
  },
});

// Homepage structured data: the organisation itself (RealEstateAgent +
// LocalBusiness) and the WebSite entity that points at it.
const organization = organizationJsonLd();
const homepageStructuredData = [
  organization,
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: "Banc Property Group",
    url: absoluteUrl("/"),
    publisher: { "@id": organization["@id"] },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Banc Property Group | Independent Estate Agents",
    description: "Exceptional properties and bespoke estate agency services in Cuffley and Hertfordshire",
    url: absoluteUrl("/"),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    about: { "@id": organization["@id"] },
  },
];

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <JsonLd data={homepageStructuredData} />
      <div className="bg-white text-banc-dark">
        <Header transparent />
        <main>
          <Hero />
          <PropertySearch />
          <FeaturedListings />
          {/* RecommendedProperties removed from homepage: renders empty-state
              cards ("No Image / £0") until the AI feed has real data — see
              DESIGN.md "no empty-state cards on the public homepage". */}
          <Services />
          <Testimonials />
          {/* SoldBanner removed: its sold prices/addresses are seeded mock
              data presented as fact — misrepresentation risk on a live agency
              site. Restore only with real sold records. */}
        </main>
        <Footer />
      </div>
    </>
  );
}
