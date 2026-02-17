"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { motion } from "framer-motion";
import PropertyCard from "@/app/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, List } from "lucide-react";

const properties = [
  {
    title: "The Laurels",
    address: "Hadley Wood, EN4",
    price: "£2,450,000",
    tags: ["New Listing", "Premium", "Video Tour"],
    stats: { beds: 5, baths: 4, sqft: 3820, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Elegant modern residence with landscaped gardens and seamless indoor-outdoor living.",
  },
  {
    title: "Mayfair Penthouse",
    address: "Mount Street, W1",
    price: "£3,900,000",
    tags: ["Premium", "Video Tour"],
    stats: { beds: 3, baths: 3, sqft: 2100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Light-filled penthouse with panoramic views, concierge service, and private terrace.",
  },
  {
    title: "Cuffley House",
    address: "Cuffley, Hertfordshire",
    price: "£1,350,000",
    tags: ["New Listing", "Premium"],
    stats: { beds: 4, baths: 3, sqft: 2600, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Characterful family home with open-plan living, media room, and expansive gardens.",
  },
  {
    title: "Woodland Manor",
    address: "Brookmans Park, AL9",
    price: "£1,850,000",
    tags: ["Premium", "Gardens"],
    stats: { beds: 5, baths: 4, sqft: 3200, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Stunning detached residence set within mature grounds with woodland views and triple garage.",
  },
  {
    title: "The Old Rectory",
    address: "Potters Bar, EN6",
    price: "£2,100,000",
    tags: ["Period Property", "Grade II"],
    stats: { beds: 6, baths: 3, sqft: 4100, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Impressive Grade II listed former rectory with period features, modernised throughout.",
  },
  {
    title: "Parkside Apartment",
    address: "Mayfair, W1K",
    price: "£1,650,000",
    tags: ["Apartment", "Park View"],
    stats: { beds: 2, baths: 2, sqft: 1100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Elegant two-bedroom apartment overlooking Hyde Park with concierge and underground parking.",
  },
];

export default function SalesPropertiesPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-2">For Sale</p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                Properties for Sale
              </h1>
              <p className="mt-2 text-white/70">
                {properties.length} properties available
              </p>
            </div>
            <Button className="bg-[#1DBFDD] hover:bg-[#0E8CAB] text-white px-6 py-5">
              <Filter className="mr-2 h-4 w-4" />
              Filter Results
            </Button>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="border-b border-[#E5E7EB] bg-[#F9FAFB] py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <span>Sort by:</span>
              <select className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#111827]">
                <option>Price (High to Low)</option>
                <option>Price (Low to High)</option>
                <option>Newest First</option>
                <option>Bedrooms</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-[#1DBFDD] p-2 text-white">
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button className="rounded-lg bg-white p-2 text-[#6B7280] border border-[#E5E7EB]">
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {properties.map((property) => (
              <motion.div
                key={property.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <PropertyCard {...property} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pagination */}
      <section className="border-t border-[#E5E7EB] py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" className="border-[#E5E7EB]" disabled>
              Previous
            </Button>
            <Button className="bg-[#1DBFDD] text-white">1</Button>
            <Button variant="outline" className="border-[#E5E7EB]">2</Button>
            <Button variant="outline" className="border-[#E5E7EB]">3</Button>
            <Button variant="outline" className="border-[#E5E7EB]">
              Next
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
