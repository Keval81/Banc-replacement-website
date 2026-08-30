import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/app/sections/Hero";
import PropertySearch from "@/app/sections/PropertySearch";
import FeaturedListings from "@/app/sections/FeaturedListings";
import Services from "@/app/sections/Services";
import Testimonials from "@/app/sections/Testimonials";
// GoogleReviews removed — covered by Testimonials section
// Partner logos moved to Footer

export const metadata: Metadata = {
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
    url: "https://bancproperty.com",
    images: [
      {
        url: "/api/og",
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
  alternates: {
    canonical: "https://bancproperty.com",
  },
};

// Homepage structured data
const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Banc Property Group | Independent Estate Agents",
  description: "Exceptional properties and bespoke estate agency services in Cuffley and Hertfordshire",
  url: "https://bancproperty.com",
  mainEntity: {
    "@type": "RealEstateAgent",
    name: "Banc Property Group",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageStructuredData),
        }}
      />
      <div className="bg-white text-[#2C2A27]">
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
