"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { motion } from "framer-motion";
import PropertyCard from "@/app/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, List } from "lucide-react";

const rentalProperties = [
  {
    id: "modern-townhouse-cuffley",
    title: "Modern Townhouse",
    address: "Cuffley, EN6",
    price: "£2,850 pcm",
    tags: ["New Listing", "Furnished"],
    stats: { beds: 4, baths: 3, sqft: 1800, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Stunning modern townhouse with integrated garage, private garden, and modern kitchen.",
  },
  {
    id: "mayfair-studio-w1k",
    title: "Mayfair Studio",
    address: "South Audley Street, W1K",
    price: "£2,200 pcm",
    tags: ["Premium", "Bills Included"],
    stats: { beds: 1, baths: 1, sqft: 450, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Luxurious studio apartment in the heart of Mayfair with concierge service.",
  },
  {
    id: "family-detached-brookmans",
    title: "Family Detached",
    address: "Brookmans Park, AL9",
    price: "£3,500 pcm",
    tags: ["Unfurnished", "Garden"],
    stats: { beds: 4, baths: 2, sqft: 2100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Spacious family home with large garden, close to excellent schools and station.",
  },
  {
    id: "executive-apartment-hadley",
    title: "Executive Apartment",
    address: "Hadley Wood, EN4",
    price: "£2,100 pcm",
    tags: ["Furnished", "Parking"],
    stats: { beds: 2, baths: 2, sqft: 950, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "High specification apartment with balcony, underground parking, and gym access.",
  },
  {
    id: "period-cottage-potters",
    title: "Period Cottage",
    address: "Potters Bar, EN6",
    price: "£1,800 pcm",
    tags: ["Character", "Parking"],
    stats: { beds: 2, baths: 1, sqft: 800, epc: "D" },
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Charming period cottage with exposed beams, modern kitchen, and courtyard garden.",
  },
  {
    id: "penthouse-suite-mount",
    title: "Penthouse Suite",
    address: "Mount Street, W1",
    price: "£5,500 pcm",
    tags: ["Premium", "Furnished", "Concierge"],
    stats: { beds: 3, baths: 3, sqft: 1800, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    ],
    summary: "Exceptional three-bedroom penthouse with private terrace and 24-hour concierge.",
  },
];

export default function LettingsPropertiesPage() {
  return (
    <div className="bg-white text-[#111827]">
      <Header />
      
      {/* Hero */}
      <section className="relative bg-[#2C2F33] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#1DBFDD] mb-2">To Let</p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                Properties to Rent
              </h1>
              <p className="mt-2 text-white/70">
                {rentalProperties.length} properties available
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
            {rentalProperties.map((property) => (
              <motion.div
                key={property.id}
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
            <Button variant="outline" className="border-[#E5E7EB]">
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* Tenant Registration CTA */}
      <section className="bg-[#1DBFDD] py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Can't find what you're looking for?
          </h2>
          <p className="mt-4 text-white/90">
            Register your requirements and we'll notify you when matching properties become available.
          </p>
          <Button className="mt-6 bg-white text-[#1DBFDD] hover:bg-white/90 px-8 py-5">
            Register as a Tenant
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
