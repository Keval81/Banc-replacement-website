import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Hero from "@/app/sections/Hero";
import PropertySearch from "@/app/sections/PropertySearch";
import FeaturedListings from "@/app/sections/FeaturedListings";
import Services from "@/app/sections/Services";
import Testimonials from "@/app/sections/Testimonials";
import GoogleReviews from "@/app/sections/GoogleReviews";
import CTABanner from "@/app/sections/CTABanner";

export const metadata: Metadata = {
  title: "Banc Property Services | Premium Estate Agency",
  description:
    "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and beyond.",
  openGraph: {
    title: "Banc Property Services",
    description:
      "Exceptional properties and bespoke estate agency services in Cuffley, Mayfair, and beyond.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      <main>
        <Hero />
        <PropertySearch />
        <FeaturedListings />
        <Services />
        <GoogleReviews />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
