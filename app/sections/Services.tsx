"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Residential Sales",
    description: "Premium marketing, accurate valuations, and a seamless sales journey from instruction to completion.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    href: "/sales",
    accent: "text-banc-sky",
  },
  {
    title: "Lettings",
    description: "Find quality tenants fast with our concierge-level service and full property management.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    href: "/lettings",
    accent: "text-banc-sky",
  },
  {
    title: "Premier Homes",
    description: "Discreet, bespoke service for exceptional properties valued at £1 million and above.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    href: "/premier-homes",
    accent: "text-banc-gold",
  },
  {
    title: "Property Management",
    description: "Full-service management with trusted suppliers, transparent reporting, and peace of mind.",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    href: "/lettings/landlords-guide",
    accent: "text-banc-sky",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-banc-dark-deep py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-banc-sky mb-3">Our Services</p>
          <h2 className="text-3xl font-medium text-white sm:text-4xl font-serif">
            Comprehensive Property Services
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={service.href}
                className="group relative block h-64 sm:h-72 overflow-hidden rounded-xl"
              >
                {/* Background Image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className={`text-xl font-semibold text-white sm:text-2xl ${
                    service.title === "Premier Homes" ? "font-serif" : ""
                  }`}>
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">
                    {service.description}
                  </p>
                  <span className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${service.accent} transition-all group-hover:gap-2`}>
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
