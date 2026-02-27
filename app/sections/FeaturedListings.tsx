"use client";

import { motion } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";

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
      "AI-generated summary placeholder. Elegant modern residence with landscaped gardens and seamless indoor-outdoor living.",
  },
  {
    id: "mayfair-penthouse-mount-street",
    title: "Mayfair Penthouse",
    address: "Mount Street, W1",
    price: "£3,900,000",
    tags: ["Premium", "Video Tour"],
    stats: { beds: 3, baths: 3, sqft: 2100, epc: "C" },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    ],
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80",
    floorplanImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
    summary:
      "AI-generated summary placeholder. Light-filled penthouse with panoramic views, concierge service, and private terrace.",
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
      "AI-generated summary placeholder. Characterful family home with open-plan living, media room, and expansive gardens.",
  },
];

export default function FeaturedListings() {
  return (
    <section id="featured" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 lg:px-10">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#6B7280]">Featured</p>
          <h2 className="text-3xl font-semibold text-[#111827] sm:text-4xl">
            Featured Properties
          </h2>
        </div>

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
          className="mt-12 grid gap-8 lg:grid-cols-3"
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
