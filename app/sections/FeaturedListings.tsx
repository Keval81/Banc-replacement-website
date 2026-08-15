"use client";

import { motion } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import { SectionHeader } from "@/components/SectionHeader";

const listings = [
  {
    id: "the-laurels-hadley-wood",
    title: "The Laurels",
    address: "Hadley Wood, EN4",
    price: "£2,450,000",
    tags: ["New Listing", "Premium", "Video Tour"],
    stats: { beds: 5, baths: 4, sqft: 3820, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1600&q=80",
    floorplanImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Elegant modern residence with landscaped gardens and seamless indoor-outdoor living.",
  },
  {
    id: "brookmans-park-oak-lodge",
    title: "Oak Lodge",
    address: "Brookmans Park, AL9",
    price: "£1,875,000",
    tags: ["Premium", "Video Tour"],
    stats: { beds: 5, baths: 3, sqft: 3100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    floorplanImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Substantial detached home by the golf course, with a garden studio and southerly views.",
  },
  {
    id: "cuffley-house-hertfordshire",
    title: "Cuffley House",
    address: "Cuffley, Hertfordshire",
    price: "£1,350,000",
    tags: ["New Listing", "Premium"],
    stats: { beds: 4, baths: 3, sqft: 2600, epc: "B" },
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1577086664693-8945ed4d2d7c?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Characterful family home with open-plan living, media room, and expansive gardens.",
  },
];

export default function FeaturedListings() {
  return (
    <section id="featured" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-20 lg:py-28 lg:px-10">
        <SectionHeader number="02" label="Featured" title="Homes on the market now" />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <PropertyCard {...listing} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
