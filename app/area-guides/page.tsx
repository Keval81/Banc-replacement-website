import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, TreePine, Building2, MapPin } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Area Guides | Banc Property Services",
  description: "Explore property market insights for Cuffley, Mayfair and surrounding areas. Local knowledge from your expert estate agent.",
};

const areas = [
  {
    name: "Cuffley",
    type: "Village",
    description: "A charming Hertfordshire village offering excellent schools, green spaces, and easy access to London.",
    avgPrice: "£850,000",
    highlights: ["Outstanding schools", "Cuffley Station", "Green belt location", "Village community"]
  },
  {
    name: "Mayfair",
    type: "Central London",
    description: "One of London's most prestigious addresses, offering luxury living in the heart of the capital.",
    avgPrice: "£2,500,000",
    highlights: ["Bond Street", "Hyde Park", "Exclusive boutiques", "Fine dining"]
  },
  {
    name: "Hadley Wood",
    type: "Suburb",
    description: "An affluent suburb with large detached properties, golf courses, and excellent transport links.",
    avgPrice: "£1,200,000",
    highlights: ["Hadley Wood Station", "Golf courses", "Large gardens", "Family friendly"]
  },
  {
    name: "Brookmans Park",
    type: "Village",
    description: "A sought-after village with a strong community feel and excellent local amenities.",
    avgPrice: "£950,000",
    highlights: ["Good schools", "Local shops", "Community events", "Green spaces"]
  }
];

export default function AreaGuidesPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-4">Local Expertise</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Area Guides
            </h1>
            <p className="mt-6 text-lg text-white/70">
              Discover the best places to live with our comprehensive area guides. 
              Local knowledge from your expert estate agent.
            </p>
          </div>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-2">
            {areas.map((area) => (
              <div key={area.name} className="rounded-2xl border border-[#E5E7EB] p-8 hover:border-[#1DBFDD] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-[#1DBFDD]" />
                  <span className="text-sm text-[#6B7280]">{area.type}</span>
                </div>
                <h2 className="text-2xl font-semibold">{area.name}</h2>
                <p className="mt-2 text-[#6B7280]">{area.description}</p>
                <div className="mt-4">
                  <p className="text-sm text-[#6B7280]">Average property price</p>
                  <p className="text-xl font-semibold text-[#1DBFDD]">{area.avgPrice}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {area.highlights.map((highlight) => (
                    <span key={highlight} className="rounded-full bg-[#F9FAFB] px-3 py-1 text-sm text-[#6B7280]">
                      {highlight}
                    </span>
                  ))}
                </div>
                <Link 
                  href={`/area-guides/${area.name.toLowerCase().replace(' ', '-')}`}
                  className="mt-6 inline-flex items-center text-[#1DBFDD] hover:underline"
                >
                  Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local Knowledge */}
      <section className="bg-[#F9FAFB] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD]">Expertise</p>
            <h2 className="mt-4 text-3xl font-semibold">Why Local Knowledge Matters</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <TreePine className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-lg font-semibold">Community Insight</h3>
              <p className="mt-2 text-[#6B7280]">
                We know the schools, amenities, and local features that make each area special.
              </p>
            </div>
            <div className="text-center">
              <Building2 className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-lg font-semibold">Market Knowledge</h3>
              <p className="mt-2 text-[#6B7280]">
                Accurate valuations based on real local sales data and market trends.
              </p>
            </div>
            <div className="text-center">
              <MapPin className="h-12 w-12 text-[#1DBFDD] mx-auto" />
              <h3 className="mt-4 text-lg font-semibold">Hidden Gems</h3>
              <p className="mt-2 text-[#6B7280]">
                Access to off-market properties and insider knowledge on upcoming listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
