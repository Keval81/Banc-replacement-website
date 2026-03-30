import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/app/sections/Hero";
import PropertySearch from "@/app/sections/PropertySearch";
import FeaturedListings from "@/app/sections/FeaturedListings";
import Services from "@/app/sections/Services";
import Testimonials from "@/app/sections/Testimonials";
import GoogleReviews from "@/app/sections/GoogleReviews";
import TrustSection from "@/app/sections/TrustSection";
import RecommendedProperties from "@/components/ai/RecommendedProperties";

export const metadata: Metadata = {
  title: "Banc Property Group | Award-Winning Estate Agents",
  description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and Hertfordshire. Award-winning team, premium marketing, and expert valuations. Your property journey starts here.",
  keywords: [
    "estate agents cuffley",
    "property for sale hertfordshire",
    "estate agents mayfair",
    "luxury homes for sale",
    "property valuations",
    "banc property group",
  ],
  openGraph: {
    title: "Banc Property Group | Award-Winning Estate Agents",
    description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and Hertfordshire.",
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
    title: "Banc Property Group | Award-Winning Estate Agents",
    description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and Hertfordshire.",
  },
  alternates: {
    canonical: "https://bancproperty.com",
  },
};

// Homepage structured data
const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Banc Property Group | Award-Winning Estate Agents",
  description: "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and Hertfordshire",
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
        <Header />
        <main>
          <Hero />
          <PropertySearch />
          <FeaturedListings />
          <RecommendedProperties 
            title="AI-Picked Properties For You"
            location="Cuffley"
            limit={3}
          />
          <Services />
          <GoogleReviews />
          <Testimonials />
          <TrustSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
